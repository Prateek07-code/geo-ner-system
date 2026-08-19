"""
GeoNER — Day 2 integration tests for main.py

Tests the API layer's hardening in isolation from whatever bugs currently
exist in the real ML pipeline: empty input, whitespace, oversized input,
and a simulated pipeline crash (to prove /analyze degrades gracefully
instead of 500ing with a raw traceback).

Run with:  python tests/test_main_api.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def check(label, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        raise AssertionError(label)


def main():
    print("=== /health ===")
    r = client.get("/health")
    check("health returns 200", r.status_code == 200)
    check("health body is {'status': 'ok'}", r.json() == {"status": "ok"})

    print("\n=== Empty input ===")
    r = client.post("/analyze", json={"sentence": ""})
    check("empty string returns 200", r.status_code == 200)
    check("empty string returns zero entities", r.json()["entities"] == [])

    print("\n=== Whitespace-only input ===")
    r = client.post("/analyze", json={"sentence": "   \n\t  "})
    check("whitespace-only returns 200", r.status_code == 200)
    check("whitespace-only returns zero entities", r.json()["entities"] == [])

    print("\n=== Missing 'sentence' field entirely ===")
    r = client.post("/analyze", json={})
    check("missing field returns 422 (pydantic validation)", r.status_code == 422)

    print("\n=== Oversized input ===")
    huge = "Aurangabad " * 500  # way past MAX_SENTENCE_LENGTH
    r = client.post("/analyze", json={"sentence": huge})
    check("oversized input returns 413", r.status_code == 413)

    print("\n=== Simulated pipeline crash (never 500s the client) ===")
    r = client.post("/analyze", json={"sentence": "This will CRASH_ME on purpose."})
    check("pipeline crash still returns 200", r.status_code == 200)
    check("pipeline crash returns empty entities, not a raw error", r.json()["entities"] == [])
    check("sentence is still echoed back correctly on crash",
          r.json()["sentence"] == "This will CRASH_ME on purpose.")

    print("\n=== Normal sentence (no real entities in this stub, but shape holds) ===")
    r = client.post("/analyze", json={"sentence": "A perfectly normal sentence."})
    check("normal sentence returns 200", r.status_code == 200)
    check("response has 'sentence' and 'entities' keys",
          set(r.json().keys()) == {"sentence", "entities"})

    print("\n=== Caching: identical requests don't error on repeat ===")
    r1 = client.post("/analyze", json={"sentence": "Repeat this exact sentence."})
    r2 = client.post("/analyze", json={"sentence": "Repeat this exact sentence."})
    check("first call succeeds", r1.status_code == 200)
    check("second identical call succeeds (served from cache)", r2.status_code == 200)
    check("both calls return identical body", r1.json() == r2.json())

    print("\nAll Day 2 API hardening tests passed.")


if __name__ == "__main__":
    main()