"""
GeoNER — Backend API (Final Sprint, Day 2: hardening)

Adds to Day 1's version:
  - Graceful handling when the pipeline itself throws (never a raw 500
    with a stack trace leaking to the client)
  - A sane input-size cap, so one huge paste can't hang the request
  - In-memory caching of repeated identical sentences (same input ->
    same output, cheap to skip recomputation). Cache lives in RAM only
    for the life of the process -- nothing written to disk, consistent
    with the data-minimisation rule in privacy_log.py.

Run:
    uvicorn main:app --reload --port 8000
"""

import logging
from functools import lru_cache
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from normalize import normalize
from privacy_log import log_resolution
from pipeline import analyze_sentence
from gazetteer import lookup as gazetteer_lookup

app = FastAPI(title="GeoNER API", version="0.3.0-sprint-day2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_logger = logging.getLogger("geoner.api")
api_logger.setLevel(logging.INFO)
if not api_logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
    api_logger.addHandler(_h)

MAX_SENTENCE_LENGTH = 2000  # generous for a single sentence/short paragraph


# ---------- Models (unchanged contract from Day 1) ----------

class AnalyzeRequest(BaseModel):
    sentence: str


class ResolvedLocation(BaseModel):
    state: str
    district: str
    lat: float
    lon: float
    confidence: float


class Alternate(BaseModel):
    state: str
    confidence: float


class Entity(BaseModel):
    text: str
    start: int
    end: int
    status: Literal["resolved", "no_confident_match"]
    resolved: Optional[ResolvedLocation] = None
    alternates: list[Alternate] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    sentence: str
    entities: list[Entity]


# ---------- Cached pipeline call ----------
# Cache key is the exact original sentence text. RAM-only (lru_cache),
# process lifetime only -- nothing persisted, no privacy concern beyond
# what's already true of a running server holding a request in memory.

@lru_cache(maxsize=512)
def _cached_analyze(original_sentence: str) -> tuple:
    result = analyze_sentence(original_sentence, gazetteer_lookup=gazetteer_lookup)
    entities = result.get("entities", [])
    return tuple(entities)


# ---------- Routes ----------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    # --- Input size guard ---
    if len(req.sentence) > MAX_SENTENCE_LENGTH:
        raise HTTPException(
            status_code=413,
            detail=f"Sentence too long ({len(req.sentence)} chars). "
                   f"Max is {MAX_SENTENCE_LENGTH}.",
        )

    # Stage 1 — normalise
    normalized = normalize(req.sentence)

    # --- Empty / whitespace-only input: skip the pipeline entirely ---
    if not normalized.original.strip():
        return AnalyzeResponse(sentence=normalized.original, entities=[])

    # Stages 2+3+4 — NLP pair's pipeline (cached by exact sentence text)
    try:
        entities = list(_cached_analyze(normalized.original))
    except Exception as exc:
        # Never leak a raw stack trace to the client. Log server-side,
        # return a valid, contract-shaped response with zero entities.
        api_logger.error(f"Pipeline failure for a sentence of length {len(normalized.original)}: {exc}")
        return AnalyzeResponse(sentence=normalized.original, entities=[])

    # Privacy-safe logging: place + confidence + timestamp ONLY
    for ent in entities:
        resolved = ent.get("resolved")
        confidence = resolved["confidence"] if resolved else None
        log_resolution(
            place_text=ent.get("text", ""),
            confidence=confidence,
            status=ent.get("status", "unknown"),
        )

    return AnalyzeResponse(sentence=normalized.original, entities=entities)