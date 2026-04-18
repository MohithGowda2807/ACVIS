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
    "horrible", "worst", "drain", "fail", "disappoint", "useless",
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


def analyze_batch(reviews: list[dict], client: Optional[Groq] = None) -> list[dict]:
    """
    Analyze a batch of up to 10 reviews using Groq.
    Falls back to llama-3.1-8b-instant on rate limit, then keyword fallback.
    """
    if client is None:
        api_key = os.getenv("GROQ_API_KEY")
        client = Groq(api_key=api_key)

    try:
        logger.debug(f"Calling Groq (llama-3.3-70b-versatile) for {len(reviews)} reviews")
        return _call_groq(client, "llama-3.3-70b-versatile", reviews)
    except Exception as e:
        logger.warning(f"Primary model failed: {e} — trying fallback model")
        try:
            return _call_groq(client, "llama-3.1-8b-instant", reviews)
        except Exception as e2:
            logger.error(f"Fallback model also failed: {e2} — using keyword classifier")
            return [_keyword_fallback(r) for r in reviews]


def analyze_all_reviews(reviews: list[dict], batch_size: int = 10) -> list[dict]:
    """
    Process all reviews in batches of up to 10.
    Returns results in the same order as input.
    """
    api_key = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=api_key) if api_key else None
    if not client:
        logger.warning("No GROQ_API_KEY set — using keyword fallback for all reviews")
        return [_keyword_fallback(r) for r in reviews]

    results = []
    for i in range(0, len(reviews), batch_size):
        batch = reviews[i:i + batch_size]
        t0 = time.time()
        batch_results = analyze_batch(batch, client)
        elapsed = round((time.time() - t0) * 1000)
        logger.info(f"NLP batch {i//batch_size + 1}: {len(batch)} reviews → {elapsed}ms")

        # Merge: ensure every review has a result (even if API dropped one)
        result_map = {r["review_id"]: r for r in batch_results}
        for r in batch:
            results.append(result_map.get(r["review_id"], _keyword_fallback(r)))

    return results
