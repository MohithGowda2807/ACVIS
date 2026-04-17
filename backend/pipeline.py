from database import raw_reviews
from datetime import datetime
import uuid

def run_pipeline(reviews):
    # Step 1: Store raw reviews
    stored = []
    for r in reviews:
        doc = r.dict()
        if not doc.get("review_id"):
            doc["review_id"] = str(uuid.uuid4())
        if not doc.get("timestamp"):
            doc["timestamp"] = datetime.utcnow().isoformat()
        
        # avoid duplicates
        if not raw_reviews.find_one({"review_id": doc["review_id"]}):
            raw_reviews.insert_one(doc)
        stored.append(doc)

    return {
        "status": "success",
        "reviews_processed": len(stored),
        "message": "Raw reviews stored. NLP pipeline coming next."
    }