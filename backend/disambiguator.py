"""
Disambiguation engine for GeoNER.
Owns: disambiguate(entity_text, sentence_context, candidates) -> dict

candidates come from Backend's gazetteer lookup(), schema locked in Phase 1:
    {"name": str, "asciiname": str, "state": str, "district": str,
     "lat": float, "lon": float, "population": int, "feature_code": str}
"""

CONTEXT_WEIGHT = 0.7
POPULATION_WEIGHT = 0.3
MAX_ALTERNATES = 3   # cap returned alternates -- real data can produce 100+ candidates


def disambiguate(entity_text: str, sentence_context: str, candidates: list[dict],
                  sibling_entities: list[str] | None = None) -> dict:
    if not candidates:
        return {"status": "no_confident_match", "resolved": None, "alternates": []}

    if len(candidates) == 1:
        return {
            "status": "resolved",
            "resolved": _build_resolved(candidates[0], confidence=0.95),
            "alternates": [],
        }

    scored = []
    for c in candidates:
        context_score = _context_match_score(sentence_context, c, sibling_entities)
        pop_score = _population_score(c, candidates)
        combined = CONTEXT_WEIGHT * context_score + POPULATION_WEIGHT * pop_score
        scored.append((combined, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_score, top = scored[0]

    resolved = _build_resolved(top, confidence=round(min(top_score, 0.99), 2))
    alternates = [
        {"state": c.get("state") or "Unknown", "confidence": round(s, 2)}
        for s, c in scored[1:MAX_ALTERNATES + 1]
    ]
    return {"status": "resolved", "resolved": resolved, "alternates": alternates}


def _build_resolved(c: dict, confidence: float) -> dict:
    """
    Real GeoNames rows can have state/district = None (metadata gaps in the
    dataset). Backend's Pydantic model requires both as non-null str, so
    coerce here rather than letting a None slip through and crash /analyze.
    """
    return {
        "state": c.get("state") or "Unknown",
        "district": c.get("district") or "Unknown",
        "lat": c["lat"], "lon": c["lon"], "confidence": confidence,
    }


def _context_match_score(sentence_context: str, candidate: dict,sibling_entities: list[str] | None = None) -> float:
    """
    Two signals, combined:
      1. Substring match of state/district against the raw sentence
         (existing behavior, unchanged).
      2. Sibling-entity match: if another *detected entity* in the same
         sentence textually matches this candidate's state/district,
         that's a much stronger signal than a raw substring hit, because
         it's confirmed to be a real place mention, not a coincidental
         word overlap. Weighted higher than plain substring match.
    """

    text_lower = sentence_context.lower()
    state = (candidate.get("state") or "").lower()
    district = (candidate.get("district") or "").lower()

    score = 0.0
    # Signal 1 — raw substring match (existing behavior)
    if state and state in text_lower:
        score += 0.8
    if district and district in text_lower:
        score += 0.2

    # Signal 2 — sibling entity match (new: nested/compound handling)
    if sibling_entities:
        siblings_lower = [s.lower() for s in sibling_entities]
        for sib in siblings_lower:
            if not sib:
                continue
            # sibling exactly names the state or district
            if sib == state or sib == district:
                score += 0.4
            # sibling is a substring of state/district or vice versa —
            # catches "Rohini" matching within a longer district name,
            # or a sibling like "Delhi" matching state "NCT of Delhi"
            elif sib in state or sib in district or state in sib or district in sib:
                score += 0.25    

    return min(score, 1.0)


def _population_score(candidate: dict, all_candidates: list[dict]) -> float:
    """
    Normalize population against the max among the candidate set.
    Used as a fallback signal when no context clue exists — bigger place
    is statistically the more likely intended one.
    """
    populations = [c.get("population", 0) or 0 for c in all_candidates]
    max_pop = max(populations) if populations else 0
    if max_pop == 0:
        return 0.5  # no population data at all — stay neutral
    return (candidate.get("population", 0) or 0) / max_pop