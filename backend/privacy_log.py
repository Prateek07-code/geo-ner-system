"""
GeoNER — Privacy-safe logging (Day 1 requirement: data minimisation)

This is the team's actual answer to the "what about privacy?" Q&A question
-- it needs to be TRUE of the running system, not just a claim in the deck.

Rule: never persist the raw input sentence anywhere beyond the
request/response cycle. If we log anything about a resolved entity, log
only place name, confidence, and timestamp.
"""

import logging
from datetime import datetime, timezone

logger = logging.getLogger("geoner.resolutions")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)


def log_resolution(place_text: str, confidence: float, status: str) -> None:
    """
    Call this once per resolved entity. Deliberately takes only
    place_text/confidence/status -- there is no parameter for the raw
    sentence, on purpose, so it's structurally impossible to accidentally
    log full user input here.
    """
    entry = {
        "place": place_text,
        "confidence": round(confidence, 3) if confidence is not None else None,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    logger.info(entry)