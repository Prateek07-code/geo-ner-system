"""
Owner: Person 1 (Data & Database) -- Stage 1: Raw Signal Intake

Lightweight text normalization run before anything else touches the
sentence. Keeps the ORIGINAL sentence for display in the API response,
and produces a separate cleaned copy for matching.

INTEGRATION NOTE FOR PERSON 2:
    main.py's /analyze should call normalize(payload.sentence) at the top
    and use result.original for the response's "sentence" field (unchanged
    from today) and result.cleaned wherever text is handed to entity
    detection / gazetteer lookups. No existing field names or response
    shape change -- this only affects what /analyze does internally.
"""

import unicodedata
from dataclasses import dataclass


@dataclass(frozen=True)
class NormalizedText:
    original: str
    cleaned: str


def normalize(sentence: str) -> NormalizedText:
    original = sentence
    cleaned = unicodedata.normalize("NFKC", sentence).strip()
    cleaned = " ".join(cleaned.split())
    return NormalizedText(original=original, cleaned=cleaned)
