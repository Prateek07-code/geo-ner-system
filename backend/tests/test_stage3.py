"""
Owner: Person 1 (Data & Database)

Practical regression tests for gazetteer.lookup() and the Stage 3
FAISS + RapidFuzz Jaro-Winkler matcher, run against a small synthetic
fixture (see backend/data/README or docs/backend_notes.md for how the
fixture is generated).

Run with:  python backend/tests/test_stage3.py
(Plain asserts + prints -- no pytest dependency required, deliberately,
so it runs the same way for every teammate with zero extra setup.)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import gazetteer  # noqa: E402


def check(label, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        raise AssertionError(label)


def main():
    print("=== Exact match ===")
    chennai = gazetteer.lookup("Chennai")
    check("Chennai returns exactly 1 clean exact match", len(chennai) == 1)
    check("Chennai match_score is 100 (exact)", chennai[0]["match_score"] == 100.0)
    check("Chennai state is Tamil Nadu", chennai[0]["state"] == "Tamil Nadu")

    print("\n=== Ambiguous (exact match, multiple candidates) ===")
    aurangabad = gazetteer.lookup("Aurangabad")
    check("Aurangabad returns >= 2 candidates", len(aurangabad) >= 2)
    states = {c["state"] for c in aurangabad}
    check("Aurangabad candidates include Maharashtra", "Maharashtra" in states)
    check("Aurangabad candidates include Bihar", "Bihar" in states)
    check("All Aurangabad candidates are exact (score 100)",
          all(c["match_score"] == 100.0 for c in aurangabad))

    rampur = gazetteer.lookup("Rampur")
    check("Rampur returns >= 2 candidates", len(rampur) >= 2)

    print("\n=== Misspelled (Stage 3: FAISS shortlist -> Jaro-Winkler) ===")
    ahemdabad = gazetteer.lookup("Ahemdabad")
    check("Ahemdabad (typo) returns at least 1 candidate", len(ahemdabad) >= 1)
    check("Ahemdabad top candidate is Ahmedabad",
          ahemdabad[0]["asciiname"] == "Ahmedabad")
    check("Ahemdabad top candidate score is < 100 (not an exact match)",
          ahemdabad[0]["match_score"] < 100.0)
    check("Ahemdabad top candidate score is reasonably high (>= 80)",
          ahemdabad[0]["match_score"] >= 80.0)

    print("\n=== Manual override (Allahabad -> Prayagraj) ===")
    allahabad = gazetteer.lookup("Allahabad")
    check("Allahabad resolves to at least 1 candidate", len(allahabad) >= 1)
    check("Allahabad resolves to Prayagraj",
          any(c["asciiname"] == "Prayagraj" for c in allahabad))

    print("\n=== Nonsense (must return empty, not a forced guess) ===")
    nonsense1 = gazetteer.lookup("Xyzabadistan")
    check("'Xyzabadistan' returns zero candidates", nonsense1 == [])

    nonsense2 = gazetteer.lookup("randomgarbagexyz")
    check("'randomgarbagexyz' returns zero candidates", nonsense2 == [])

    print("\n=== Edge cases (must not crash) ===")
    check("Empty string returns []", gazetteer.lookup("") == [])
    check("Whitespace-only returns []", gazetteer.lookup("   ") == [])
    check("None-like short junk doesn't crash", gazetteer.lookup("x") == gazetteer.lookup("x"))

    print("\n=== Backward-compat: limit kwarg still works (main.py calls limit=5) ===")
    limited = gazetteer.lookup("Aurangabad", limit=1)
    check("limit=1 truncates to 1 result", len(limited) == 1)
    unlimited = gazetteer.lookup("Aurangabad", limit=None)
    check("limit=None returns all candidates", len(unlimited) == len(aurangabad))

    print("\nAll Stage 3 tests passed.")


if __name__ == "__main__":
    main()
