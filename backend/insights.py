"""
insights.py — Aggregation, spike detection, trend prediction for ACVIS.
Stage 5 of the 6-stage NLP pipeline.
"""

import logging
from collections import defaultdict, Counter
from datetime import datetime, timezone

logger = logging.getLogger("acvis.insights")

ROOT_CAUSE_KEYWORDS = {
    "software": ["update", "patch", "version", "firmware", "rollout"],
    "hardware": ["hardware", "build", "physical", "manufacturing", "defect"],
    "delivery": ["shipping", "courier", "delivered", "package", "dispatch"],
    "support": ["customer", "service", "response", "refund", "return"],
}


def _detect_root_cause(keywords: list[str]) -> dict[str, str]:
    """Map keywords to root cause labels."""
    causes = {}
    kw_lower = [k.lower() for k in keywords]
    for cause, triggers in ROOT_CAUSE_KEYWORDS.items():
        if any(t in " ".join(kw_lower) for t in triggers):
            causes[cause] = {
                "software": "Recent software update",
                "hardware": "Hardware defect",
                "delivery": "Delivery / logistics issue",
                "support": "Customer support failure",
            }[cause]
    return causes


def aggregate_insights(nlp_results: list[dict], db=None) -> dict:
    """
    Stage 5: Compute comprehensive insights from NLP results.
    Stores to MongoDB insights collection if db is provided.
    """
    feature_data: dict[str, dict] = defaultdict(lambda: {
        "positive": 0, "negative": 0, "neutral": 0,
        "total": 0, "confidence_sum": 0.0
    })
    trend_data: dict[str, dict[str, dict]] = defaultdict(lambda: defaultdict(
        lambda: {"positive": 0, "negative": 0, "neutral": 0, "total": 0}
    ))
    all_keywords: list[str] = []
    emotion_dist: dict[str, int] = defaultdict(int)
    sarcasm_count = 0

    for r in nlp_results:
        # Emotion
        emotion = r.get("emotion", "neutral")
        emotion_dist[emotion] += 1

        # Sarcasm
        if r.get("sarcasm_detected", False):
            sarcasm_count += 1

        # Keywords
        all_keywords.extend(r.get("keywords", []))

        # Timestamp → day key
        ts = r.get("timestamp") or datetime.now(timezone.utc).isoformat()
        try:
            day = ts[:10]  # "YYYY-MM-DD"
        except Exception:
            day = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # Aspect sentiment
        for aspect, sent_info in r.get("aspect_sentiment", {}).items():
            if isinstance(sent_info, dict):
                label = sent_info.get("label", "neutral")
                conf = float(sent_info.get("confidence", 0.5))
            else:
                label = str(sent_info)
                conf = 0.5

            fd = feature_data[aspect]
            fd[label] = fd.get(label, 0) + 1
            fd["total"] += 1
            fd["confidence_sum"] += conf

            td = trend_data[aspect][day]
            td[label] = td.get(label, 0) + 1
            td["total"] += 1

    # ─── Feature Sentiment Summary ───
    feature_sentiment_summary = {}
    for asp, d in feature_data.items():
        total = d["total"] or 1
        feature_sentiment_summary[asp] = {
            "positive_ratio": round(d["positive"] / total, 3),
            "negative_ratio": round(d["negative"] / total, 3),
            "neutral_ratio": round(d["neutral"] / total, 3),
            "total_mentions": d["total"],
            "avg_confidence": round(d["confidence_sum"] / total, 3),
        }

    # ─── Spike Detection (3-day moving average) ───
    spike_detected = {}
    for asp, days in trend_data.items():
        sorted_days = sorted(days.keys())
        for i, day in enumerate(sorted_days):
            prev_days = sorted_days[max(0, i - 3):i]
            if len(prev_days) < 1:
                continue
            avg_neg = sum(days[d]["negative"] for d in prev_days) / len(prev_days)
            cur_neg = days[day]["negative"]
            if avg_neg > 0 and cur_neg >= avg_neg * 2.0:
                pct = round(((cur_neg - avg_neg) / avg_neg) * 100)
                spike_detected[asp] = {"spike": True, "increase_percent": pct, "day": day}

    # ─── Root Cause Detection ───
    root_cause = {}
    for r in nlp_results:
        for asp in r.get("aspects", []):
            causes = _detect_root_cause(r.get("keywords", []))
            if causes:
                root_cause[asp] = list(causes.values())[0]

    # ─── Top Keywords ───
    kw_counter = Counter(all_keywords)
    top_keywords = [kw for kw, _ in kw_counter.most_common(10)]

    total_reviews = len(nlp_results) or 1
    insights = {
        "feature_sentiment_summary": feature_sentiment_summary,
        "trend_data": {asp: dict(days) for asp, days in trend_data.items()},
        "spike_detected": spike_detected,
        "emotion_distribution": dict(emotion_dist),
        "sarcasm_rate": round(sarcasm_count / total_reviews, 4),
        "top_keywords": top_keywords,
        "root_cause": root_cause,
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }

    # ─── Persist to MongoDB ───
    if db is not None:
        try:
            db.insights.replace_one({}, insights, upsert=True)
            logger.info("Insights persisted to MongoDB")
        except Exception as e:
            logger.warning(f"MongoDB insights write failed (non-fatal): {e}")

    return insights
