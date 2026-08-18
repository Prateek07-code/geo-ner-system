"""
GeoNER — Backend API (Final Sprint)

Live flow:
    raw sentence
      -> normalize()                 [Stage 1 — Data pair]
      -> analyze_sentence(...)       [Stages 2+3+4 — NLP pair + Real Gazetteer]
      -> log_resolution() per entity   [privacy-safe logging]
      -> AnalyzeResponse               [contract shape with status field]

Run:
    uvicorn main:app --reload --port 8000
"""

from typing import Literal, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from normalize import normalize
from privacy_log import log_resolution

# Real pipeline & gazetteer imports (all inside backend/)
from pipeline import analyze_sentence
from gazetteer import lookup as gazetteer_lookup

app = FastAPI(title="GeoNER API", version="0.2.0-sprint-day1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models (Contract Shape) ----------

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


# ---------- Routes ----------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    # Stage 1 — Normalise raw text
    normalized = normalize(req.sentence)

    # Stages 2+3+4 — NLP pipeline connected to the real gazetteer DB
    result = analyze_sentence(
        normalized.original, 
        gazetteer_lookup=gazetteer_lookup
    )
    entities = result.get("entities", [])

    # Privacy-safe logging: place + confidence + status ONLY (no raw sentences)
    for ent in entities:
        resolved = ent.get("resolved")
        confidence = resolved["confidence"] if resolved else None
        log_resolution(
            place_text=ent.get("text", ""),
            confidence=confidence,
            status=ent.get("status", "unknown"),
        )

    # Response echoes the ORIGINAL sentence for proper frontend highlighting offsets
    return AnalyzeResponse(sentence=normalized.original, entities=entities)