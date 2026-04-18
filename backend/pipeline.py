"""
pipeline.py — 6-stage NLP pipeline for ACVIS (drop-in replacement).
Orchestrates: ingest → preprocess → nlp_analyze → normalize → aggregate → actions
"""

import hashlib
import logging
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

try:
    from .nlp import analyze_all_reviews
    from .insights import aggregate_insights
    from .actions import generate_actions
    from .database import get_db, save_reviews, save_insights, cache_get, cache_set
except ImportError:
    from nlp import analyze_all_reviews
    from insights import aggregate_insights
    from actions import generate_actions
    from database import get_db, save_reviews, save_insights, cache_get, cache_set

logger = logging.getLogger("acvis.pipeline")

# ─── Sentence-transformer (loaded once at startup) ──────────────────────────
_embedder = None
_canonical_embeddings = None
CANONICAL_ASPECTS = [
    "battery", "camera", "performance", "ui", "display",
    "audio", "build_quality", "price", "delivery", "customer_support", "general"
]

def _get_embedder():
    global _embedder, _canonical_embeddings
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            import numpy as np
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
            _canonical_embeddings = _embedder.encode(
                [a.replace("_", " ") for a in CANONICAL_ASPECTS],
                normalize_embeddings=True
            )
            logger.info("[OK] sentence-transformer loaded")
        except Exception as e:
            logger.warning(f"[WARN] sentence-transformer unavailable: {e}")
            _embedder = False  # mark as attempted-and-failed
    return _embedder if _embedder is not False else None


# ─── Slang map ──────────────────────────────────────────────────────────────
SLANG_MAP = {
    "u": "you", "ur": "your", "r": "are", "pls": "please",
    "plz": "please", "thx": "thanks", "ty": "thank you",
    "tbh": "to be honest", "imo": "in my opinion", "irl": "in real life",
    "bc": "because", "w/": "with", "w/o": "without",
    "gonna": "going to", "wanna": "want to", "gotta": "got to",
    "kinda": "kind of", "sorta": "sort of", "lol": "", "lmao": "",
    "omg": "oh my god", "wtf": "what the", "ngl": "not going to lie",
    "smh": "shaking my head", "fwiw": "for what it is worth",
    "tho": "though", "rn": "right now", "imo": "in my opinion",
    "ikr": "i know right", "brb": "be right back", "btw": "by the way",
    "afaik": "as far as I know", "idk": "i do not know",
    "imo": "in my opinion", "asap": "as soon as possible",
}

CONTRACTIONS = {
    "can't": "cannot", "won't": "will not", "don't": "do not",
    "doesn't": "does not", "isn't": "is not", "aren't": "are not",
    "wasn't": "was not", "weren't": "were not", "haven't": "have not",
    "hasn't": "has not", "didn't": "did not", "couldn't": "could not",
    "shouldn't": "should not", "wouldn't": "would not", "i'm": "i am",
    "it's": "it is", "that's": "that is", "there's": "there is",
    "they're": "they are", "we're": "we are", "you're": "you are",
    "i've": "i have", "you've": "you have", "we've": "we have",
    "they've": "they have", "i'll": "i will", "you'll": "you will",
    "he'll": "he will", "she'll": "she will", "we'll": "we will",
    "they'll": "they will", "i'd": "i would", "you'd": "you would",
}


# ─── Stage 1: Ingest ────────────────────────────────────────────────────────
def ingest(reviews: list[dict]) -> list[dict]:
    t0 = time.time()
    seen_hashes = set()
    result = []
    for r in reviews:
        text = str(r.get("text", "")).strip()
        if len(text.split()) < 5:
            continue
        h = hashlib.md5(text.lower().encode()).hexdigest()
        if h in seen_hashes:
            continue
        seen_hashes.add(h)
        result.append({
            "review_id": str(r.get("review_id") or uuid.uuid4()),
            "text": text,
            "rating": r.get("rating"),
            "timestamp": r.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            "source": r.get("source", "unknown"),
        })
    logger.info(f"[ingest] {len(reviews)} in → {len(result)} out | {_ms(t0)}ms")
    return result


# ─── Stage 2: Preprocess ────────────────────────────────────────────────────
def _expand_contractions(text: str) -> str:
    for c, e in CONTRACTIONS.items():
        text = re.sub(rf"\b{re.escape(c)}\b", e, text, flags=re.I)
    return text


def _map_slang(text: str) -> str:
    return " ".join(SLANG_MAP.get(w, w) for w in text.split())


def _clean(text: str) -> str:
    t = text.lower()
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"<[^>]*>", "", t)
    t = re.sub(r"[^\w\s'.,!?-]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def _detect_lang(text: str) -> str:
    try:
        from langdetect import detect
        return detect(text)
    except Exception:
        return "en"


def _translate(text: str, src: str) -> tuple[str, bool]:
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source=src, target="en").translate(text)
        return translated, True
    except Exception as e:
        logger.warning(f"Translation failed: {e}")
        return text, False


def preprocess(reviews: list[dict]) -> list[dict]:
    t0 = time.time()
    result = []
    for r in reviews:
        text = r["text"]
        lang = _detect_lang(text)
        language_processed = True
        if lang != "en":
            text, language_processed = _translate(text, lang)
        clean = _clean(text)
        clean = _expand_contractions(clean)
        clean = _map_slang(clean)
        result.append({
            **r,
            "original_text": r["text"],
            "clean_text": clean,
            "language": lang,
            "language_processed": language_processed,
        })
    logger.info(f"[preprocess] {len(reviews)} in → {len(result)} out | {_ms(t0)}ms")
    return result


# ─── Stage 3: NLP Analyze ───────────────────────────────────────────────────
def nlp_analyze(reviews: list[dict]) -> list[dict]:
    t0 = time.time()

    # Check Redis cache first per review
    cached_results = {}
    uncached = []
    for r in reviews:
        text = r.get("clean_text", r["text"])
        cached = cache_get(text)
        if cached:
            cached["review_id"] = r["review_id"]
            cached["timestamp"] = r.get("timestamp")
            cached_results[r["review_id"]] = cached
        else:
            uncached.append(r)

    fresh = analyze_all_reviews(uncached, batch_size=10) if uncached else []

    # Cache fresh results
    for i, result in enumerate(fresh):
        text = uncached[i].get("clean_text", uncached[i]["text"])
        cache_set(text, result)
        result["timestamp"] = uncached[i].get("timestamp")

    # Merge in original order
    fresh_map = {r["review_id"]: r for r in fresh}
    ordered = []
    for r in reviews:
        rid = r["review_id"]
        if rid in cached_results:
            ordered.append(cached_results[rid])
        elif rid in fresh_map:
            ordered.append(fresh_map[rid])

    # Flip sarcasm
    for item in ordered:
        if item.get("sarcasm_detected", False):
            for asp, sent in item.get("aspect_sentiment", {}).items():
                if isinstance(sent, dict):
                    sent["label"] = "positive" if sent["label"] == "negative" else "negative"

    logger.info(f"[nlp_analyze] {len(reviews)} in (cache hits: {len(cached_results)}) | {_ms(t0)}ms")
    return ordered


# ─── Stage 4: Normalize Aspects ─────────────────────────────────────────────
def normalize_aspects(nlp_results: list[dict]) -> list[dict]:
    t0 = time.time()
    embedder = _get_embedder()

    if embedder is None:
        logger.info("[normalize_aspects] skipped (no sentence-transformer)")
        return nlp_results

    import numpy as np
    for item in nlp_results:
        raw_aspects = item.get("aspects", [])
        normalized_map = {}
        new_sentiment = {}

        for asp in raw_aspects:
            asp_emb = embedder.encode([asp.replace("_", " ")], normalize_embeddings=True)[0]
            sims = np.dot(_canonical_embeddings, asp_emb)
            best_idx = int(np.argmax(sims))
            best_score = float(sims[best_idx])
            canonical = CANONICAL_ASPECTS[best_idx] if best_score >= 0.75 else asp
            normalized_map[asp] = canonical
            sent = item.get("aspect_sentiment", {}).get(asp)
            if sent:
                new_sentiment[canonical] = sent

        item["aspects_raw"] = raw_aspects
        item["aspects"] = list(set(normalized_map.values()))
        item["aspect_sentiment"] = new_sentiment

    logger.info(f"[normalize_aspects] {len(nlp_results)} reviews | {_ms(t0)}ms")
    return nlp_results


# ─── Stage 5 & 6 delegated to insights.py / actions.py ─────────────────────

# ─── Full pipeline orchestrator ─────────────────────────────────────────────
def run_pipeline(raw_reviews: list[dict]) -> dict:
    """Run all 6 stages and return the full structured response."""
    total_t0 = time.time()
    timings = {}
    db = get_db()

    # Stage 1
    t = time.time(); ingested = ingest(raw_reviews); timings["ingest_ms"] = _ms(t)

    # Stage 2
    t = time.time(); processed = preprocess(ingested); timings["preprocess_ms"] = _ms(t)

    # Stage 3
    t = time.time(); analyzed = nlp_analyze(processed); timings["nlp_ms"] = _ms(t)

    # Stage 4
    t = time.time(); normalized = normalize_aspects(analyzed); timings["normalize_ms"] = _ms(t)

    # Merge timestamp back for trend data
    proc_map = {r["review_id"]: r for r in processed}
    for item in normalized:
        if "timestamp" not in item or not item["timestamp"]:
            item["timestamp"] = proc_map.get(item["review_id"], {}).get("timestamp")

    # Stage 5
    t = time.time(); aggregated = aggregate_insights(normalized, db); timings["aggregate_ms"] = _ms(t)

    # Stage 6
    t = time.time(); action_list = generate_actions(aggregated); timings["actions_ms"] = _ms(t)

    timings["total_ms"] = _ms(total_t0)

    # Persist reviews
    save_reviews(processed)

    return {
        "status": "success",
        "reviews_processed": len(ingested),
        "pipeline_timing": timings,
        "insights": aggregated,
        "actions": action_list,
        # For backwards-compat with existing frontend
        "feature_sentiment": aggregated.get("feature_sentiment_summary", {}),
        "trend_alerts": aggregated.get("spike_detected", {}),
        "emotions": aggregated.get("emotion_distribution", {}),
        "ai_outputs": normalized,
    }


def _ms(t0: float) -> int:
    return round((time.time() - t0) * 1000)
