"""
ACVIS Pipeline — Full NLP processing with MongoDB persistence at every stage
"""
try:
    from .database import raw_reviews, processed_reviews, ai_outputs, insights, actions_col, ensure_db_setup
    from .nlp_engine import (
        ingest_reviews, preprocess_single, analyze_single,
        aggregate_feature_sentiment, aggregate_trends, detect_spikes,
        identify_root_causes, aggregate_emotions, compute_predictions,
        generate_decisions, calculate_revenue_impact,
    )
except ImportError:
    from database import raw_reviews, processed_reviews, ai_outputs, insights, actions_col, ensure_db_setup
    from nlp_engine import (
        ingest_reviews, preprocess_single, analyze_single,
        aggregate_feature_sentiment, aggregate_trends, detect_spikes,
        identify_root_causes, aggregate_emotions, compute_predictions,
        generate_decisions, calculate_revenue_impact,
    )
import logging
from concurrent.futures import ProcessPoolExecutor
from pymongo import UpdateOne
import os

logger = logging.getLogger("acvis.pipeline")


def run_pipeline(reviews_data: list) -> dict:
    # --- Step 0: Ensure DB is ready ---
    ensure_db_setup()
    
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
    if raw:
        ops = [UpdateOne({"review_id": doc["review_id"]}, {"$set": doc}, upsert=True) for doc in raw]
        try:
            raw_reviews.bulk_write(ops)
        except Exception as e:
            logger.warning(f"Failed to bulk store raw reviews: {e}")
    logger.info(f"  -> {len(raw)} reviews ingested")

    # --- Stage 2: Preprocessing (Adaptive Parallelism) ---
    logger.info("Stage 2: Preprocessing...")
    # Parallelism threshold: Don't use ProcessPool for small batches (Windows overhead)
    if len(raw) < 50:
        logger.info("  (Small batch: using sequential processing)")
        processed = [preprocess_single(r) for r in raw]
    else:
        logger.info(f"  (Large batch: using ProcessPool with {min(4, os.cpu_count() or 1)} workers)")
        with ProcessPoolExecutor(max_workers=min(4, os.cpu_count() or 1)) as executor:
            processed = list(executor.map(preprocess_single, raw))
    
    if processed:
        ops = [UpdateOne({"review_id": doc["review_id"]}, {"$set": doc}, upsert=True) for doc in processed]
        try:
            processed_reviews.bulk_write(ops)
        except Exception as e:
            logger.warning(f"Failed to bulk store processed reviews: {e}")
    logger.info(f"  -> {len(processed)} reviews preprocessed")

    # --- Stage 3: NLP Analysis (Adaptive Parallelism) ---
    logger.info("Stage 3: Running NLP analysis...")
    if len(processed) < 50:
        logger.info("  (Small batch: using sequential processing)")
        ai_results = [analyze_single(r) for r in processed]
    else:
        logger.info(f"  (Large batch: using ProcessPool with {min(4, os.cpu_count() or 1)} workers)")
        with ProcessPoolExecutor(max_workers=min(4, os.cpu_count() or 1)) as executor:
            ai_results = list(executor.map(analyze_single, processed))
        
    if ai_results:
        ops = [UpdateOne({"review_id": doc["review_id"]}, {"$set": doc}, upsert=True) for doc in ai_results]
        try:
            ai_outputs.bulk_write(ops)
        except Exception as e:
            logger.warning(f"Failed to bulk store AI outputs: {e}")
    logger.info(f"  -> {len(ai_results)} reviews analyzed")

    # --- Stage 4: Insights ---
    logger.info("Stage 4: Generating insights...")
    feature_sentiment = aggregate_feature_sentiment(ai_results)
    trends = aggregate_trends(ai_results)
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
    }
    try:
        insights.delete_many({})  # Keep latest only
        insights.insert_one(insight_doc)
    except Exception as e:
        logger.warning(f"Failed to store insights: {e}")

    # --- Stage 5: Decisions ---
    logger.info("Stage 5: Generating decisions...")
    decisions = generate_decisions(feature_sentiment, trend_alerts, root_causes, predictions)
    revenue_impact = calculate_revenue_impact(predictions, feature_sentiment, trend_alerts)

    action_doc = {
        "actions": decisions["actions"],
        "alerts": decisions["alerts"],
        "revenue_impact": revenue_impact,
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
        "raw_reviews": raw,
    }
