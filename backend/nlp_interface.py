"""
GeoNER — PLACEHOLDER for the NLP/ML pair's analyze_sentence()

DELETE THIS FILE once you have their real ml/analyze_sentence.py.
Swap the import in main.py from:
    from nlp_interface import analyze_sentence
to:
    from ml.analyze_sentence import analyze_sentence   # or wherever they land it

This stub exists purely so /analyze keeps returning a valid, contract-shaped
response (including the new `status` field) while you wait for their real
Stage 2 + Stage 4 pipeline. It does NOT do real NER or disambiguation.

REAL SIGNATURE (confirm this matches what NLP hands you):
    analyze_sentence(sentence: str) -> dict
    Returns: {"entities": [ {text, start, end, status, resolved, alternates}, ... ]}
    (No "sentence" key — main.py adds that itself from the normalised text.)

IMPORTANT INTEGRATION FLAG: analyze_sentence() internally needs to call
your friend's gazetteer.lookup(name) (which handles exact match + the
FAISS/RapidFuzz fuzzy fallback internally, in gazetteer.py + fuzzy_index.py)
to get candidates for each entity it detects, before it can disambiguate.
Make sure the NLP pair has (or can import) gazetteer.py, fuzzy_index.py,
and a built data/gazetteer.db — this is a real cross-pair dependency,
flag it in your Day 1 sync so nobody's blocked discovering it late.
"""


def analyze_sentence(sentence: str) -> dict:
    # Hardcoded placeholder response, matches the updated contract shape
    # (including status) from the sprint doc's own example.
    return {
        "entities": [
            {
                "text": "Aurangabad",
                "start": sentence.find("Aurangabad") if "Aurangabad" in sentence else 22,
                "end": (sentence.find("Aurangabad") + len("Aurangabad")) if "Aurangabad" in sentence else 32,
                "status": "resolved",
                "resolved": {
                    "state": "Maharashtra",
                    "district": "Chhatrapati Sambhajinagar",
                    "lat": 19.8762,
                    "lon": 75.3433,
                    "confidence": 0.91,
                },
                "alternates": [
                    {"state": "Bihar", "confidence": 0.09},
                ],
            }
        ]
    }