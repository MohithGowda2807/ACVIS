"""
ACVIS Pipeline — Full NLP processing with MongoDB persistence at every stage
"""
try:
    from .database import raw_reviews, processed_reviews, ai_outputs, insights, actions_col
    from .nlp_engine import (
        ingest_reviews, preprocess_all, analyze_all,
        aggregate_feature_sentiment, aggregate_trends, detect_spikes,
        identify_root_causes, aggregate_emotions, compute_predictions,
        generate_decisions, calculate_revenue_impact,
    )
except ImportError:
    from database import raw_reviews, processed_reviews, ai_outputs, insights, actions_col
    from nlp_engine import (
        ingest_reviews, preprocess_all, analyze_all,
        aggregate_feature_sentiment, aggregate_trends, detect_spikes,
        identify_root_causes, aggregate_emotions, compute_predictions,
        generate_decisions, calculate_revenue_impact,
    )
import logging

logger = logging.getLogger("acvis.pipeline")


def run_pipeline(reviews_data: list) -> dict:
    """
    Execute full ACVIS pipeline:
    1. Ingest -> raw_reviews
    2. Preprocess -> processed_reviews
    3. NLP Analyze -> ai_outputs
    4. Aggregate -> insights
    5. Decisions -> actions
    """
    # Convert Pydantic models to dicts if needed
    reviews_list = []
    for r in reviews_data:
        if hasattr(r, "dict"):
            reviews_list.append(r.dict())
        elif hasattr(r, "model_dump"):
            reviews_list.append(r.model_dump())
        elif isinstance(r, dict):
            reviews_list.append(r)
        else:
            reviews_list.append({"text": str(r)})

    # --- Stage 1: Ingestion ---
    logger.info("Stage 1: Ingesting reviews...")
    raw = ingest_reviews(reviews_list)
    for doc in raw:
        try:
            raw_reviews.update_one(
                {"review_id": doc["review_id"]},
                {"$set": doc},
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Failed to store raw review: {e}")
    logger.info(f"  -> {len(raw)} reviews ingested")

    # --- Stage 2: Preprocessing ---
    logger.info("Stage 2: Preprocessing...")
    processed = preprocess_all(raw)
    for doc in processed:
        try:
            processed_reviews.update_one(
                {"review_id": doc["review_id"]},
                {"$set": doc},
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Failed to store processed review: {e}")
    logger.info(f"  -> {len(processed)} reviews preprocessed")

    # --- Stage 3: NLP Analysis ---
    logger.info("Stage 3: Running NLP analysis...")
    ai_results = analyze_all(processed)
    for doc in ai_results:
        try:
            ai_outputs.update_one(
                {"review_id": doc["review_id"]},
                {"$set": doc},
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Failed to store AI output: {e}")
    logger.info(f"  -> {len(ai_results)} reviews analyzed")

    # --- Stage 4: Insights ---
    logger.info("Stage 4: Generating insights...")
    
    # Filter out fake reviews for sentiment aggregation
    verified_outputs = [out for out in ai_results if not out.get("is_fake")]
    fake_count = len(ai_results) - len(verified_outputs)
    fake_stats = {
        "fake_count": fake_count,
        "fake_percentage": round((fake_count / len(ai_results)) * 100, 2) if ai_results else 0
    }

    feature_sentiment = aggregate_feature_sentiment(verified_outputs)
    trends = aggregate_trends(verified_outputs)
    trend_alerts = detect_spikes(trends)
    root_causes = identify_root_causes(ai_results, processed)
    emotions = aggregate_emotions(ai_results)
    predictions = compute_predictions(ai_results)

    insight_doc = {
        "feature_sentiment": feature_sentiment,
        "trends": trends,
        "trend_alerts": trend_alerts,
        "root_causes": root_causes,
        "emotions": emotions,
        "predictions": predictions,
        "reviews_count": len(raw),
        "fake_review_stats": fake_stats
    }
    try:
        insights.delete_many({})  # Keep latest only
        insights.insert_one(insight_doc)
    except Exception as e:
        logger.warning(f"Failed to store insights: {e}")

    # --- Stage 5: Decisions ---
    logger.info("Stage 5: Generating decisions...")
    decisions = generate_decisions(feature_sentiment, trend_alerts, root_causes, predictions)
    
    # Add fake review alert if needed
    if fake_stats["fake_percentage"] > 15:
        decisions["alerts"].append({
            "priority": "high",
            "feature": "system",
            "message": "High volume of suspicious reviews detected",
            "reason": f"{fake_stats['fake_percentage']}% of reviews flagged as potential spam/bots"
        })
        decisions["actions"].append({
            "priority": "high",
            "feature": "system",
            "action": "Enable manual review moderation or tougher CAPTCHA",
            "reason": f"Spam/Bot detection triggered at {fake_stats['fake_percentage']}%"
        })

    revenue_impact = calculate_revenue_impact(predictions, feature_sentiment, trend_alerts)

    action_doc = {
        "actions": decisions["actions"],
        "alerts": decisions["alerts"],
        "revenue_impact": revenue_impact,
        "fake_review_stats": fake_stats
    }
    try:
        actions_col.delete_many({})
        actions_col.insert_one(action_doc)
    except Exception as e:
        logger.warning(f"Failed to store actions: {e}")

    logger.info("[OK] Pipeline complete!")

    return {
        "status": "success",
        "reviews_processed": len(raw),
        "feature_sentiment": feature_sentiment,
        "predictions": predictions,
        "alerts": decisions["alerts"],
        "actions": decisions["actions"],
        "trends": trends,
        "trend_alerts": trend_alerts,
        "root_causes": root_causes,
        "emotions": emotions,
        "revenue_impact": revenue_impact,
        "fake_review_stats": fake_stats,
        "raw_reviews": raw,
    }
