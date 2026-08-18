"""
GeoNER — Backend API (Final Sprint, Day 1)

Live flow:
    raw sentence
      -> normalize()                   [Stage 1 — Person 1 / Data pair]
      -> analyze_sentence(original)    [Stages 2+3+4 — NLP pair]
      -> log_resolution() per entity   [privacy-safe logging]
      -> AnalyzeResponse                [contract shape, with status field]

IMPORTANT: analyze_sentence() is called with normalized.original, NOT
normalized.cleaned. This is deliberate -- extract_entities() must run on
the exact same string that gets echoed back as "sentence" in the response,
otherwise start/end offsets from NER won't line up with what the frontend
highlights. cleaned text is still available (normalized.cleaned) for
narrower uses downstream, e.g. inside gazetteer lookups on individual
matched place names -- just not for the whole-sentence NER pass.

Run:
    uvicorn main:app --reload --port 8000

SWAP WHEN READY: replace the `nlp_interface` import below with the NLP
pair's real module once they hand it over (e.g. `from pipeline import
analyze_sentence`, once pipeline.py is dropped into this folder).
"""

from typing import Literal, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from normalize import normalize
from privacy_log import log_resolution

# --- SWAP THIS IMPORT once the NLP pair hands over their real file ---
from nlp_interface import analyze_sentence

app = FastAPI(title="GeoNER API", version="0.2.0-sprint-day1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models (updated contract: status field added) ----------

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
    # Stage 1 — normalise (Person 1's normalize())
    normalized = normalize(req.sentence)

    # Stages 2+3+4 — NLP pair's pipeline.
    # Deliberately using `original`, not `cleaned` -- see module docstring.
    result = analyze_sentence(normalized.original)
    entities = result.get("entities", [])

    # Privacy-safe logging: place + confidence + timestamp ONLY, never
    # the raw sentence. This must stay true for the running system.
    for ent in entities:
        resolved = ent.get("resolved")
        confidence = resolved["confidence"] if resolved else None
        log_resolution(
            place_text=ent.get("text", ""),
            confidence=confidence,
            status=ent.get("status", "unknown"),
        )

    # Response echoes the ORIGINAL sentence (matches Person 1's integration note)
    return AnalyzeResponse(sentence=normalized.original, entities=entities)