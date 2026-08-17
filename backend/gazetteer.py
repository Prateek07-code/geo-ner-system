"""
Owner: Person 1 (Data & Database)

Provides lookup(name) -> list[dict], returning candidate places that
could match a given place-name string, ranked by relevance. This is the
function the Backend & API layer (main.py) calls to resolve entities
detected by the NLP pair.

Matching strategy (final-sprint version):
  1. Overrides -- a tiny manual table for known renamed places
     (e.g. "allahabad" -> "prayagraj"), checked before anything else.
  2. Exact match on name / asciiname (case-insensitive) -- highest
     confidence. If any exact match exists, Stage 3 (FAISS/RapidFuzz) is
     skipped entirely -- an exact hit never needs fuzzy correction.
  3. On a miss only: Stage 3 fuzzy correction --
     FAISS (character n-gram vectors) narrows ~556k names down to a
     shortlist, then RapidFuzz's Jaro-Winkler scores that shortlist
     precisely. Candidates below the similarity threshold are dropped,
     so nonsense input correctly yields zero candidates rather than a
     forced wrong match.
  4. Results are de-duplicated by (name, state, district) and sorted by
     match score, then by population (bigger place first as a tiebreaker
     for same-score matches).
"""

import sqlite3
from pathlib import Path
from typing import List, Dict, Optional

import fuzzy_index

DB_PATH = Path(__file__).resolve().parent / "data" / "gazetteer.db"

# Small, explicit overrides for well-known renamed places. Intentionally
# minimal per the sprint plan -- NOT a live sync pipeline, just enough to
# honestly demo the concept.
RENAMED_PLACE_OVERRIDES = {
    "allahabad": "prayagraj",
    "bombay": "mumbai",
    "madras": "chennai",
    "calcutta": "kolkata",
    "bangalore": "bengaluru",
}


class GazetteerNotBuiltError(RuntimeError):
    """Raised when gazetteer.db doesn't exist yet -- run build_gazetteer.py first."""


def _get_connection() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise GazetteerNotBuiltError(
            f"{DB_PATH} not found. Run `python backend/etl/build_gazetteer.py` first."
        )
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _row_to_dict(row: sqlite3.Row, score: float) -> Dict:
    return {
        "geonameid": row["geonameid"],
        "name": row["name"],
        "asciiname": row["asciiname"],
        "state": row["state"] or None,
        "district": row["district"] or None,
        "lat": row["latitude"],
        "lon": row["longitude"],
        "population": row["population"],
        "feature_code": row["feature_code"],
        "match_score": round(score, 1),
    }


def _exact_matches(conn: sqlite3.Connection, name_lower: str) -> List[sqlite3.Row]:
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM places WHERE name_lower = ? OR asciiname_lower = ?",
        (name_lower, name_lower),
    )
    return cur.fetchall()


def _rows_by_asciiname(conn: sqlite3.Connection, asciiname_lower: str) -> List[sqlite3.Row]:
    cur = conn.cursor()
    cur.execute("SELECT * FROM places WHERE asciiname_lower = ?", (asciiname_lower,))
    return cur.fetchall()


def _all_asciinames(conn: sqlite3.Connection) -> List[str]:
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT asciiname_lower FROM places")
    return [r[0] for r in cur.fetchall() if r[0]]


def lookup(name: str, limit: Optional[int] = None) -> List[Dict]:
    """
    Return candidate places matching `name`, best match first.

    limit=None (default) returns ALL candidates -- this is the Phase 1
    contract and what Stage 4 disambiguation needs to see every plausible
    option. Pass an explicit limit only if a caller specifically wants a
    capped result (kept for backward compatibility with existing callers).

    Returns an empty list if nothing reasonably close is found -- callers
    should treat that as "no confident match" (status: no_confident_match)
    rather than guessing.
    """
    if not name or not name.strip():
        return []

    name_lower = name.strip().lower()
    name_lower = RENAMED_PLACE_OVERRIDES.get(name_lower, name_lower)

    conn = _get_connection()
    try:
        results: List[Dict] = []
        seen_keys = set()

        # 1. Exact match first. If we get any hit, Stage 3 is skipped
        #    entirely -- an exact match never needs fuzzy correction.
        exact_rows = _exact_matches(conn, name_lower)
        for row in exact_rows:
            key = (row["name"], row["state"], row["district"])
            if key in seen_keys:
                continue
            seen_keys.add(key)
            results.append(_row_to_dict(row, score=100.0))

        if results:
            results.sort(key=lambda r: (-r["match_score"], -(r["population"] or 0)))
            return results[:limit] if limit else results

        # 2. Miss -> Stage 3: FAISS shortlist + RapidFuzz Jaro-Winkler.
        scored_candidates = fuzzy_index.shortlist_and_score(
            name_lower, all_names_fn=lambda: _all_asciinames(conn)
        )

        for candidate_name, score in scored_candidates:
            for row in _rows_by_asciiname(conn, candidate_name):
                key = (row["name"], row["state"], row["district"])
                if key in seen_keys:
                    continue
                seen_keys.add(key)
                results.append(_row_to_dict(row, score=score))

        results.sort(key=lambda r: (-r["match_score"], -(r["population"] or 0)))
        return results[:limit] if limit else results
    finally:
        conn.close()


def get_by_geonameid(geonameid: int) -> Optional[Dict]:
    """Fetch a single place by its exact GeoNames ID."""
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM places WHERE geonameid = ?", (geonameid,))
        row = cur.fetchone()
        return _row_to_dict(row, score=100.0) if row else None
    finally:
        conn.close()


if __name__ == "__main__":
    # Quick manual smoke test: python backend/gazetteer.py
    for test_name in ["Aurangabad", "Ahemdabad", "Rampur", "Chennai", "Allahabad", "Xyzabadistan"]:
        print(f"\nlookup('{test_name}'):")
        for candidate in lookup(test_name):
            print(" ", candidate)
