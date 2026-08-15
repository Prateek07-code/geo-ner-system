"""
gazetteer.py
Owner: Person 1 (Data & Database)

Provides lookup(name) -> list[dict], returning candidate places that
could match a given place-name string, ranked by relevance. This is the
function the Backend & API layer (main.py) calls to resolve entities
detected by the NLP pair.

Matching strategy:
  1. Exact match on name / asciiname (case-insensitive) -- highest confidence.
  2. Fuzzy match (RapidFuzz) only when no exact match exists -- catches
     likely spelling mistakes such as "Ahemdabad" -> "Ahmedabad".
  3. Results are de-duplicated by (name, state, district) and sorted by
     match score, then by population.
"""

import sqlite3
from pathlib import Path
from typing import Dict, List, Optional

from rapidfuzz import fuzz, process


DB_PATH = Path(__file__).resolve().parent / "data" / "gazetteer.db"

# Minimum fuzzy score required for a candidate.
FUZZY_THRESHOLD = 85

# Maximum number of fuzzy name candidates examined before filtering.
FUZZY_LIMIT = 25


class GazetteerNotBuiltError(RuntimeError):
    """Raised when gazetteer.db does not exist yet."""


def _get_connection() -> sqlite3.Connection:
    """Open the SQLite gazetteer database."""
    if not DB_PATH.exists():
        raise GazetteerNotBuiltError(
            f"{DB_PATH} not found. "
            "Run `python backend/etl/build_gazetteer.py` first."
        )

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _row_to_dict(row: sqlite3.Row, score: float) -> Dict:
    """Convert a SQLite row into the candidate dictionary used by the API."""
    return {
        "geonameid": row["geonameid"],
        "name": row["name"],
        "asciiname": row["asciiname"],
        "state": row["state"] or None,
        "district": row["district"] or None,
        "lat": row["latitude"],
        "lon": row["longitude"],
        "population": row["population"],
        "match_score": round(score, 1),
    }


def _exact_matches(
    conn: sqlite3.Connection,
    name_lower: str,
) -> List[sqlite3.Row]:
    """Return all exact case-insensitive name/asciiname matches."""
    cur = conn.cursor()

    cur.execute(
        """
        SELECT *
        FROM places
        WHERE name_lower = ?
           OR asciiname_lower = ?
        """,
        (name_lower, name_lower),
    )

    return cur.fetchall()


def _all_names(conn: sqlite3.Connection) -> List[str]:
    """Return all distinct ASCII place names used for fuzzy matching."""
    cur = conn.cursor()

    cur.execute(
        """
        SELECT DISTINCT asciiname_lower
        FROM places
        """
    )

    return [row[0] for row in cur.fetchall() if row[0]]


def lookup(name: str, limit: Optional[int] = None) -> List[Dict]:
    """
    Return candidate places matching `name`, best match first.

    Behavior:
      1. If exact matches exist, return all exact candidates.
      2. If no exact match exists, use fuzzy matching to catch likely
         spelling mistakes.
      3. Very short or very differently-sized fuzzy candidates are ignored
         to reduce unrelated matches.
      4. `limit` is optional. None means return all candidates.

    Examples:
        lookup("Rampur")
        lookup("Aurangabad")
        lookup("Ahemdabad")
        lookup("Rampur", limit=5)
    """
    if not name or not name.strip():
        return []

    name_lower = name.strip().lower()
    conn = _get_connection()

    try:
        results: List[Dict] = []
        seen_keys = set()

        # ---------------------------------------------------------------
        # 1. Exact matching
        # ---------------------------------------------------------------
        exact_rows = _exact_matches(conn, name_lower)

        for row in exact_rows:
            key = (
                row["name"],
                row["state"],
                row["district"],
            )

            if key in seen_keys:
                continue

            seen_keys.add(key)

            results.append(
                _row_to_dict(
                    row,
                    score=100.0,
                )
            )

        # If exact matches exist, return only exact matches.
        # This prevents cases such as "Chennai" returning unrelated
        # fuzzy candidates like "Ai", "Chen", or "Na".
        if results:
            results.sort(
                key=lambda item: (
                    -item["match_score"],
                    -(item["population"] or 0),
                )
            )

            if limit is None:
                return results

            return results[:limit]

        # ---------------------------------------------------------------
        # 2. Fuzzy matching
        # ---------------------------------------------------------------
        all_names = _all_names(conn)

        fuzzy_hits = process.extract(
            name_lower,
            all_names,
            scorer=fuzz.ratio,
            limit=FUZZY_LIMIT,
        )

        # Keep only strong matches whose length is reasonably close
        # to the query. This avoids unrelated short names such as
        # "Bad", "Daba", "Abad", etc.
        candidate_names = [
            candidate_name
            for candidate_name, score, _ in fuzzy_hits
            if (
                score >= FUZZY_THRESHOLD
                and len(candidate_name) >= 4
                and abs(len(candidate_name) - len(name_lower)) <= 2
            )
        ]

        if candidate_names:
            cur = conn.cursor()

            placeholders = ",".join(
                "?" for _ in candidate_names
            )

            cur.execute(
                f"""
                SELECT *
                FROM places
                WHERE asciiname_lower IN ({placeholders})
                """,
                candidate_names,
            )

            score_by_name = {
                candidate_name: score
                for candidate_name, score, _ in fuzzy_hits
            }

            for row in cur.fetchall():
                key = (
                    row["name"],
                    row["state"],
                    row["district"],
                )

                if key in seen_keys:
                    continue

                seen_keys.add(key)

                score = score_by_name.get(
                    row["asciiname_lower"],
                    FUZZY_THRESHOLD,
                )

                results.append(
                    _row_to_dict(
                        row,
                        score=score,
                    )
                )

        # ---------------------------------------------------------------
        # 3. Rank results
        # ---------------------------------------------------------------
        results.sort(
            key=lambda item: (
                -item["match_score"],
                -(item["population"] or 0),
            )
        )

        if limit is None:
            return results

        return results[:limit]

    finally:
        conn.close()


def get_by_geonameid(geonameid: int) -> Optional[Dict]:
    """Fetch a single place by its exact GeoNames ID."""
    conn = _get_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM places
            WHERE geonameid = ?
            """,
            (geonameid,),
        )

        row = cur.fetchone()

        if row is None:
            return None

        return _row_to_dict(
            row,
            score=100.0,
        )

    finally:
        conn.close()


if __name__ == "__main__":
    # Quick manual smoke test:
    # python backend/gazetteer.py

    for test_name in [
        "Aurangabad",
        "Ahemdabad",
        "Rampur",
        "Chennai",
    ]:
        print(f"\nlookup('{test_name}'):")

        for candidate in lookup(test_name, limit=5):
            print(" ", candidate)