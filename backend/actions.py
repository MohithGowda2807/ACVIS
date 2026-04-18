"""
actions.py — Rule-based decision engine for ACVIS (Stage 6).
Implements all 7 rules including linear regression trend prediction.
"""

import logging
from datetime import datetime, timezone

logger = logging.getLogger("acvis.actions")


def _linear_regression_predict(neg_counts: list[float]) -> dict:
    """
    Simple linear regression on last N days of negative counts.
    Returns predicted value at day N+7 and days until 0.6 threshold.
    """
    n = len(neg_counts)
    if n < 2:
        return {"next_7_days": None, "days_to_threshold": None}

    # Least-squares slope + intercept
    x_mean = (n - 1) / 2
    y_mean = sum(neg_counts) / n
    numerator = sum((i - x_mean) * (neg_counts[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))
    slope = numerator / denominator if denominator != 0 else 0
    intercept = y_mean - slope * x_mean

    predicted_7 = round(intercept + slope * (n + 6), 3)  # +7 days from last
    predicted_7 = max(0.0, min(1.0, predicted_7))

    # Days until ratio crosses 0.6
    days_to_threshold = None
    if slope > 0:
        last_val = intercept + slope * (n - 1)
        if last_val < 0.6:
            days = (0.6 - last_val) / slope
            days_to_threshold = max(0, round(days))

    return {"next_7_days": predicted_7, "days_to_threshold": days_to_threshold}


def generate_actions(insights: dict) -> list[dict]:
    """
    Stage 6: Generate prioritised action items from aggregated insights.
    Applies all 7 rules in order of severity.
    """
    actions = []
    now = datetime.now(timezone.utc).isoformat()

    fss = insights.get("feature_sentiment_summary", {})
    spikes = insights.get("spike_detected", {})
    root_causes = insights.get("root_cause", {})
    trend_data = insights.get("trend_data", {})

    for feature, stats in fss.items():
        neg_ratio = stats.get("negative_ratio", 0.0)
        pos_ratio = stats.get("positive_ratio", 0.0)
        has_spike = feature in spikes
        spike_pct = spikes.get(feature, {}).get("increase_percent", 0)
        root_cause = root_causes.get(feature)

        action_obj = {
            "feature": feature,
            "priority": None,
            "action": None,
            "reason": None,
            "root_cause": root_cause,
            "predicted_trend": None,
            "timestamp": now,
        }

        # ── Rule 1: CRITICAL — high negative + spike ──
        if neg_ratio >= 0.6 and has_spike:
            action_obj["priority"] = "critical"
            action_obj["action"] = "Release hotfix within 48 hours"
            action_obj["reason"] = (
                f"{round(neg_ratio*100)}% negative sentiment + "
                f"{spike_pct}% spike in complaints"
            )

        # ── Rule 2: HIGH — high negative, no spike ──
        elif neg_ratio >= 0.6:
            action_obj["priority"] = "high"
            action_obj["action"] = "Escalate to product team immediately"
            action_obj["reason"] = f"{round(neg_ratio*100)}% of mentions are negative"

        # ── Rule 3: MEDIUM — moderate negative ──
        elif 0.4 <= neg_ratio < 0.6:
            action_obj["priority"] = "medium"
            action_obj["action"] = "Schedule investigation sprint"
            action_obj["reason"] = "Moderate negative signal detected"

        # ── Rule 4: OPPORTUNITY — high positive ──
        elif pos_ratio >= 0.8:
            action_obj["priority"] = "opportunity"
            action_obj["action"] = "Feature in next marketing campaign"
            action_obj["reason"] = (
                f"{round(pos_ratio*100)}% positive sentiment — clear user strength"
            )

        # ── Rule 5: SPIKE_ONLY — spike but not overall negative ──
        elif has_spike and neg_ratio < 0.4:
            action_obj["priority"] = "high"
            action_obj["action"] = "Monitor closely — unusual volume spike"
            action_obj["reason"] = (
                f"Complaint volume increased {spike_pct}% without major sentiment shift"
            )

        else:
            # No rule triggered — skip adding an action
            continue

        # ── Rule 6: ROOT_CAUSE — append likely cause ──
        if root_cause and action_obj["action"]:
            action_obj["action"] += f". Likely cause: {root_cause}"

        # ── Rule 7: PREDICTION — linear regression on trend ──
        if feature in trend_data:
            sorted_days = sorted(trend_data[feature].keys())
            # Use up to last 7 days of negative ratios
            daily_negs = []
            for day in sorted_days[-7:]:
                day_data = trend_data[feature][day]
                total = day_data.get("total", 1) or 1
                daily_negs.append(day_data.get("negative", 0) / total)

            prediction = _linear_regression_predict(daily_negs)
            action_obj["predicted_trend"] = prediction

            # Generate a separate warning action if prediction crosses threshold
            if (prediction["next_7_days"] is not None and
                    prediction["next_7_days"] > 0.6 and
                    action_obj["priority"] not in ("critical", "high")):
                warning_obj = {
                    "feature": feature,
                    "priority": "warning",
                    "action": "Proactive fix recommended before sentiment worsens",
                    "reason": (
                        f"Predicted negative ratio in 7 days: "
                        f"{round(prediction['next_7_days']*100)}%"
                    ),
                    "root_cause": root_cause,
                    "predicted_trend": prediction,
                    "timestamp": now,
                }
                actions.append(warning_obj)

        actions.append(action_obj)

    # Sort by severity
    order = {"critical": 0, "high": 1, "warning": 2, "medium": 3, "opportunity": 4}
    actions.sort(key=lambda a: order.get(a["priority"], 99))
    return actions
