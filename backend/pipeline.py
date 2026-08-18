"""
ml/pipeline.py — final sprint

Wires extract_entities() (Phase 1, locked) -> gazetteer lookup ->
disambiguate() (Ayush, Stage 4) into analyze_sentence(), matching the
updated contract shape (with the "status" field).

INTEGRATION STATUS: real disambiguate() is now wired in. Only the gazetteer
lookup is still mocked — see INTEGRATION SWAP below for the one thing left.
"""

from ner_extractor import extract_entities  # Phase 1, already locked
from disambiguator import disambiguate       # Ayush, Stage 4 — now live


def _mock_lookup(name: str) -> list[dict]:
    """
    Local stand-in for Backend's gazetteer.lookup(name). Schema matches the
    Phase 1 lock: name, state, district, lat, lon, population, feature_code.

    INTEGRATION SWAP (whole-team checkpoint):
      Once Backend hands off their real lookup(), stop passing this in as
      the default and instead always call:
          analyze_sentence(sentence, gazetteer_lookup=<Backend's real lookup>)
      No other change needed in this file — the signature was locked in Phase 1.
    """
    mock_db = {
        "Aurangabad": [
            {"name": "Aurangabad", "state": "Maharashtra", "district": "Chhatrapati Sambhajinagar",
             "lat": 19.8762, "lon": 75.3433, "population": 1175116, "feature_code": "PPLA2"},
            {"name": "Aurangabad", "state": "Bihar", "district": "Aurangabad",
             "lat": 24.7522, "lon": 84.3742, "population": 96854, "feature_code": "PPLA2"},
        ],
        "Rampur": [
            {"name": "Rampur", "state": "Uttar Pradesh", "district": "Rampur",
             "lat": 28.8158, "lon": 79.0256, "population": 325313, "feature_code": "PPLA2"},
            {"name": "Rampur", "state": "Himachal Pradesh", "district": "Shimla",
             "lat": 31.4522, "lon": 77.6270, "population": 5500, "feature_code": "PPL"},
        ],
        "Bengaluru": [
            {"name": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban",
             "lat": 12.9716, "lon": 77.5946, "population": 8443675, "feature_code": "PPLA"},
        ],
    }
    return mock_db.get(name, [])


def analyze_sentence(sentence: str, gazetteer_lookup=None) -> dict:
    lookup_fn = gazetteer_lookup or _mock_lookup
    entities_out = []

    entities = extract_entities(sentence)          # call once
    all_entity_texts = [e["text"] for e in entities]

    for ent in entities:
        siblings = [t for t in all_entity_texts if t != ent["text"]]
        candidates = lookup_fn(ent["text"])
        result = disambiguate(ent["text"], sentence, candidates, sibling_entities=siblings)
        entities_out.append({
            "text": ent["text"],
            "start": ent["start"],
            "end": ent["end"],
            "status": result["status"],
            "resolved": result["resolved"],
            "alternates": result["alternates"],
        })
    return {"sentence": sentence, "entities": entities_out}

if __name__ == "__main__":
    # Manual smoke test — run with: python -m ml.pipeline  (from the nlp-ml/ folder)
    import json
    sample = "Flooding reported near Aurangabad after heavy rains in Maharashtra."
    print(json.dumps(analyze_sentence(sample), indent=2))