"""
Owner: Person 1 (Data & Database) -- Stage 3: Fuzzy-Match Correction

Implements the sprint's required two-step fuzzy matcher:

    FAISS (character n-gram vectors)  ->  fast approximate shortlist
    RapidFuzz (Jaro-Winkler)          ->  precise lexical scoring on that shortlist

Used by gazetteer.py ONLY as a fallback when an exact name match fails.
Exact matches should never be routed through this module -- see lookup()
in gazetteer.py.

The FAISS index and vectorizer are expensive to build (~30s on the full
~556k-row India gazetteer) so this module builds them ONCE, lazily, on
first use, and caches them at module level for the lifetime of the
process. Call rebuild_index(names) explicitly if the underlying place
list ever changes (e.g. after re-running the ETL).
"""

from typing import List, Tuple, Optional

import numpy as np
import faiss
from sklearn.feature_extraction.text import HashingVectorizer
from rapidfuzz.distance import JaroWinkler

# --- Tunables -------------------------------------------------------------
N_FEATURES = 256          # fixed-size hashed n-gram vector dimension
NGRAM_RANGE = (2, 3)      # character n-gram sizes
FAISS_SHORTLIST_K = 25    # how many candidates FAISS hands to RapidFuzz
JARO_WINKLER_THRESHOLD = 0.90  # 0-1 scale; below this = "no plausible candidate"

# --- Module-level cache (built once, reused across requests) --------------
_vectorizer: Optional[HashingVectorizer] = None
_index: Optional["faiss.Index"] = None
_index_names: List[str] = []  # asciiname_lower values, same order as FAISS index rows


def _build_vectorizer() -> HashingVectorizer:
    return HashingVectorizer(
        analyzer="char_wb",
        ngram_range=NGRAM_RANGE,
        n_features=N_FEATURES,
        alternate_sign=False,
        norm="l2",
    )


def rebuild_index(names: List[str]) -> None:
    """
    Build (or rebuild) the FAISS index from a list of asciiname_lower strings.
    Call this once at startup (gazetteer.py does this automatically the
    first time the fuzzy fallback is needed) or after the gazetteer data
    changes.
    """
    global _vectorizer, _index, _index_names

    _vectorizer = _build_vectorizer()
    vectors = _vectorizer.transform(names).toarray().astype("float32")
    faiss.normalize_L2(vectors)  # so inner product == cosine similarity

    index = faiss.IndexFlatIP(N_FEATURES)
    index.add(vectors)

    _index = index
    _index_names = list(names)


def _ensure_index_built(all_names_fn) -> None:
    """Lazily build the index on first use, using the provided name-loader."""
    if _index is None:
        rebuild_index(all_names_fn())


def shortlist_and_score(query: str, all_names_fn) -> List[Tuple[str, float]]:
    """
    Returns [(asciiname_lower, jaro_winkler_score_0_to_100), ...] for
    plausible candidates only (above JARO_WINKLER_THRESHOLD), best first.
    Returns [] if nothing plausible is found -- callers should treat that
    as "no confident match", never force a guess.

    `all_names_fn` is a zero-arg callable returning the full list of
    asciiname_lower strings, used only if the index hasn't been built yet.
    """
    _ensure_index_built(all_names_fn)
    if _index is None or not _index_names or not query:
        return []

    qv = _vectorizer.transform([query]).toarray().astype("float32")
    faiss.normalize_L2(qv)

    k = min(FAISS_SHORTLIST_K, len(_index_names))
    _, neighbor_idx = _index.search(qv, k)

    scored: List[Tuple[str, float]] = []
    seen = set()
    for idx in neighbor_idx[0]:
        if idx < 0:
            continue  # FAISS pads with -1 if fewer than k vectors exist
        candidate = _index_names[idx]
        if candidate in seen:
            continue
        seen.add(candidate)

        jw = JaroWinkler.normalized_similarity(query, candidate)  # 0.0-1.0
        if jw >= JARO_WINKLER_THRESHOLD:
            scored.append((candidate, round(jw * 100, 1)))

    scored.sort(key=lambda pair: -pair[1])
    return scored
