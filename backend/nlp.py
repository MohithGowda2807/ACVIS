"""
nlp.py — Groq API wrapper for ACVIS NLP pipeline
Primary: llama-3.3-70b-versatile | Fallback: llama-3.1-8b-instant
"""

import json
import os
import time
import logging
from typing import Optional
from groq import Groq

logger = logging.getLogger("acvis.nlp")

# ─── Word lists for keyword fallback ───
NEGATIVE_WORDS = [
    "terrible", "awful", "broken", "slow", "crash", "bad",
    "horrible", "worst", "drain", "drains", "draining", "fail", "disappoint", "useless",
    "frustrating", "pathetic", "disgusting", "garbage", "trash",
    "poor", "defective", "damaged", "annoying", "unresponsive", "laggy"
]
POSITIVE_WORDS = [
    "amazing", "excellent", "great", "love", "perfect", "fast",
    "smooth", "beautiful", "outstanding", "best", "fantastic", "brilliant",
    "superb", "awesome", "wonderful", "impressive", "stellar", "flawless",
    "crisp", "solid", "reliable", "recommend", "satisfied", "happy"
]

CANONICAL_ASPECTS = [
    "battery", "camera", "performance", "ui", "display",
    "audio", "build_quality", "price", "delivery", "customer_support", "general"
]

# ─── System prompt ───
SYSTEM_PROMPT = """You are an expert product analyst. Analyze customer reviews and extract structured intelligence. Always return valid JSON only. No markdown, no explanation."""

def _build_user_prompt(batch: list[dict]) -> str:
    """Build the user message for the Groq API call."""
    reviews_json = json.dumps([{"review_id": r["review_id"], "text": r.get("clean_text", r["text"])} for r in batch], indent=2)
    aspects_list = ", ".join(CANONICAL_ASPECTS)
    return f"""Analyze these {len(batch)} customer reviews. For each review, extract:
1. aspects: list of product features mentioned (normalize to: {aspects_list})
2. aspect_sentiment: for each aspect: {{label: positive/negative/neutral, confidence: 0.0-1.0}}
3. emotion: anger/frustration/satisfaction/neutral
4. sarcasm_detected: true/false
5. intensity: low/medium/high
6. keywords: top 3 meaningful phrases from the review

Return a JSON object with key "results" containing an array with one object per review in the same order.
Each object: {{review_id, aspects, aspect_sentiment: {{aspect: {{label, confidence}}}}, emotion, sarcasm_detected, intensity, keywords}}

Reviews:
{reviews_json}"""


def _keyword_fallback(review: dict) -> dict:
    """Fallback sentiment analysis using keyword counting."""
    text = review.get("clean_text", review.get("text", "")).lower()
    words = text.split()
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    total = pos + neg

    if total == 0:
        label, conf = "neutral", 0.5
    elif pos > neg:
        label, conf = "positive", round(pos / total, 2)
    else:
        label, conf = "negative", round(neg / total, 2)

    # Detect basic aspect
    aspects = []
    for a in CANONICAL_ASPECTS:
        if a.replace("_", " ") in text or a in text:
            aspects.append(a)
    if not aspects:
        aspects = ["general"]

    return {
        "review_id": review["review_id"],
        "aspects": aspects,
        "aspect_sentiment": {a: {"label": label, "confidence": conf} for a in aspects},
        "emotion": "neutral",
        "sarcasm_detected": False,
        "intensity": "medium" if total > 3 else "low",
        "keywords": [],
        "_fallback": True
    }


def _call_groq(client: Groq, model: str, batch: list[dict]) -> list[dict]:
    """Call Groq API and parse JSON response."""
    prompt = _build_user_prompt(batch)
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
        response_format={"type": "json_object"},
        max_tokens=4096,
    )
    raw = resp.choices[0].message.content
    parsed = json.loads(raw)
    # Accept either {"results": [...]} or a bare array
    if isinstance(parsed, list):
        return parsed
    if "results" in parsed:
        return parsed["results"]
    # Sometimes model returns the array under a different key
    for v in parsed.values():
        if isinstance(v, list):
            return v
    return []


# ─── Session-level state to avoid repeated rate-limit failures ───
_rate_limited_models: set[str] = set()  # models that have hit 429
_active_api_key: Optional[str] = None   # the key currently in use


def _get_client() -> Groq:
    """Get a Groq client using the best available API key."""
    global _active_api_key
    if _active_api_key:
        return Groq(api_key=_active_api_key)
    
    api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROQ_FALLBACK_API_KEY")
    _active_api_key = api_key
    return Groq(api_key=api_key)


def _try_call(client: Groq, model: str, batch: list[dict]) -> Optional[list[dict]]:
    """Try a single Groq call. Returns None on rate-limit, raises on other errors."""
    if model in _rate_limited_models:
        return None
    try:
        return _call_groq(client, model, batch)
    except Exception as e:
        err = str(e)
        if "429" in err:
            logger.warning(f"Rate limit on {model}: {err[:120]}...")
            _rate_limited_models.add(model)
            return None
        raise


def analyze_batch(reviews: list[dict], client: Optional[Groq] = None) -> list[dict]:
    """
    Analyze a batch of up to 10 reviews using Groq.
    Uses session-level caching to skip rate-limited models instantly.
    Cascade: 70b primary key → 70b fallback key → 8b primary key → 8b fallback key → keyword.
    """
    global _active_api_key
    
    api_key = os.getenv("GROQ_API_KEY")
    fallback_api_key = os.getenv("GROQ_FALLBACK_API_KEY")
    all_keys = list(dict.fromkeys(filter(None, [api_key, fallback_api_key])))  # unique, ordered
    
    # Models in preference order
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    
    for model in models:
        if model in _rate_limited_models:
            continue
        for key in all_keys:
            try:
                c = Groq(api_key=key)
                result = _call_groq(c, model, reviews)
                # Success! Remember this key for future batches.
                _active_api_key = key
                return result
            except Exception as e:
                err = str(e)
                if "429" in err:
                    logger.warning(f"Rate limit on {model} (key ...{key[-6:]}): skipping")
                    # Don't mark model as dead yet — another key might work
                    continue
                else:
                    logger.error(f"Non-rate-limit error on {model}: {e}")
                    break  # try next model
        # If all keys failed for this model with 429, mark it
        _rate_limited_models.add(model)
        logger.info(f"All keys exhausted for {model}, moving to next model")
    
    # All models exhausted → keyword fallback (instant, always works)
    logger.warning("All Groq models rate-limited — using keyword classifier")
    return [_keyword_fallback(r) for r in reviews]


def analyze_all_reviews(reviews: list[dict], batch_size: int = 10) -> list[dict]:
    """
    Process all reviews in batches of up to 10.
    Returns results in the same order as input.
    """
    if not reviews:
        return []
    
    results = []
    total_batches = (len(reviews) + batch_size - 1) // batch_size
    
    for i in range(0, len(reviews), batch_size):
        batch = reviews[i:i + batch_size]
        batch_num = i // batch_size + 1
        t0 = time.time()
        
        batch_results = analyze_batch(batch)
        
        elapsed = round((time.time() - t0) * 1000)
        logger.info(f"NLP batch {batch_num}/{total_batches}: {len(batch)} reviews → {elapsed}ms")

        # Merge: ensure every review has a result (even if API dropped one)
        result_map = {r["review_id"]: r for r in batch_results}
        for r in batch:
            results.append(result_map.get(r["review_id"], _keyword_fallback(r)))

    return results
