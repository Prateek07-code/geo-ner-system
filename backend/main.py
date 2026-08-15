"""
GeoNER — Backend API (Phase 1: MOCK)

POST /analyze returns a HARDCODED response matching the locked contract
exactly. No real NER / disambiguation is wired in yet — that's Phase 2,
where this handler will call:
    entities = extract_entities(sentence)          # from NLP/ML pair
    candidates = lookup(entity_text)                # from gazetteer.py
    ... disambiguation logic ...                     # scores candidates into resolved/alternates

Run:
    uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="GeoNER API", version="0.1.0-phase1-mock")

# Frontend dev server (Vite) origin — Frontend pair builds/runs against this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request / Response models (mirror the locked contract exactly) ----------

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
    resolved: ResolvedLocation
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
    """
    PHASE 1 MOCK: always returns the same hardcoded entity/resolution data,
    regardless of input sentence. This exists purely so the Frontend pair
    can build HighlightedText / ResolvedLocationsPanel / MapView against a
    real HTTP response with the exact contract shape, instead of a static
    JSON file. `sentence` is echoed back from the request; `entities` is
    fixed until Phase 2 wires in the real pipeline.
    """
    mock_response = AnalyzeResponse(
        sentence=req.sentence,
        entities=[
            Entity(
                text="Aurangabad",
                start=22,
                end=32,
                resolved=ResolvedLocation(
                    state="Maharashtra",
                    district="Chhatrapati Sambhajinagar",
                    lat=19.8762,
                    lon=75.3433,
                    confidence=0.91,
                ),
                alternates=[
                    Alternate(state="Bihar", confidence=0.09),
                ],
            )
        ],
    )
    return mock_response