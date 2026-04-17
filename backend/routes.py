from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import logging
import json
import os

try:
    from .models import ReviewInput, UserCreate, UserLogin, UserResponse, Token, TicketCreate, TicketUpdate, TicketResponse
    from .pipeline import run_pipeline
    from .database import users, insights, actions_col, raw_reviews, processed_reviews, ai_outputs, tickets
    from .auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
    from .middleware import get_current_user, require_company, require_user
except ImportError:
    from models import ReviewInput, UserCreate, UserLogin, UserResponse, Token, TicketCreate, TicketUpdate, TicketResponse
    from pipeline import run_pipeline
    from database import users, insights, actions_col, raw_reviews, processed_reviews, ai_outputs, tickets
    from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
    from middleware import get_current_user, require_company, require_user

logger = logging.getLogger("acvis.routes")
router = APIRouter()


# ─── Auth ───
@router.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = get_password_hash(user.password)
    user_dict = {
        "email": user.email,
        "hashed_password": hashed_pwd,
        "role": user.role,
    }
    users.insert_one(user_dict)
    return {"email": user.email, "role": user.role}


@router.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"], "role": db_user["role"]},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ─── Pipeline ───
def _load_amazon_reviews(limit: int = 500) -> list:
    """Load reviews from Amazon Reviews 2023 sample JSON."""
    import uuid

    # Try Amazon Reviews 2023 sample first
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "amazon_reviews_sample.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        reviews = []
        for item in data[:limit]:
            text = item.get("text", "").strip()
            if not text:
                continue

            # Convert HuggingFace Amazon Reviews 2023 schema to ACVIS schema
            ts = item.get("timestamp")
            if isinstance(ts, (int, float)):
                # Millisecond epoch -> ISO format
                ts = datetime.utcfromtimestamp(ts / 1000).isoformat()

            reviews.append({
                "review_id": item.get("user_id", str(uuid.uuid4())),
                "text": text,
                "rating": item.get("rating"),
                "timestamp": ts,
                "source": "amazon",
            })
        return reviews

    # Fallback: try old CSV
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "7817_1.csv")
    if os.path.exists(csv_path):
        import csv
        csv_reviews = []
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                text = row.get("reviews.text")
                if text:
                    rating = None
                    try:
                        rating = float(row.get("reviews.rating", 0))
                    except Exception:
                        pass
                    csv_reviews.append({
                        "review_id": row.get("id") or str(uuid.uuid4()),
                        "text": text,
                        "rating": rating,
                        "timestamp": row.get("reviews.date"),
                        "source": "amazon_kaggle",
                    })
                    count += 1
                    if count >= limit:
                        break
        return csv_reviews

    raise Exception("No dataset found. Run: python backend/amazon_sample_generator.py")


@router.post("/api/analyze")
async def analyze(data: ReviewInput, user=Depends(get_current_user)):
    try:
        reviews_to_process = data.reviews or []
        if data.use_csv:
            reviews_to_process = _load_amazon_reviews(500)

        result = run_pipeline(reviews_to_process)
        return result
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")


# ─── Data Endpoints ───
@router.get("/api/insights")
async def get_insights(user=Depends(get_current_user)):
    doc = insights.find_one({}, {"_id": 0})
    if not doc:
        return {"feature_sentiment": {}, "trends": {}, "predictions": {}, "emotions": {}}
    return doc


@router.get("/api/features")
async def get_features(user=Depends(get_current_user)):
    doc = insights.find_one({}, {"_id": 0, "feature_sentiment": 1})
    return doc.get("feature_sentiment", {}) if doc else {}


@router.get("/api/alerts")
async def get_alerts(user=Depends(get_current_user)):
    doc = actions_col.find_one({}, {"_id": 0, "alerts": 1})
    return doc.get("alerts", []) if doc else []


@router.get("/api/actions")
async def get_actions(user=Depends(get_current_user)):
    doc = actions_col.find_one({}, {"_id": 0, "actions": 1})
    return doc.get("actions", []) if doc else []


@router.get("/api/trends")
async def get_trends(user=Depends(get_current_user)):
    doc = insights.find_one({}, {"_id": 0, "trends": 1, "trend_alerts": 1})
    return doc if doc else {"trends": {}, "trend_alerts": {}}


@router.get("/api/revenue")
async def get_revenue(user=Depends(get_current_user)):
    doc = actions_col.find_one({}, {"_id": 0, "revenue_impact": 1})
    return doc.get("revenue_impact", {}) if doc else {}


@router.get("/api/stats")
async def get_stats(user=Depends(get_current_user)):
    return {
        "raw_reviews": raw_reviews.count_documents({}),
        "processed_reviews": processed_reviews.count_documents({}),
        "ai_outputs": ai_outputs.count_documents({}),
        "users": users.count_documents({}),
    }


@router.get("/api/auth/me")
async def get_me(user=Depends(get_current_user)):
    db_user = users.find_one({"email": user["email"]}, {"_id": 0, "hashed_password": 0})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": db_user["email"], "role": db_user["role"]}


@router.get("/api/trend_alerts")
async def get_trend_alerts(user=Depends(get_current_user)):
    doc = insights.find_one({}, {"_id": 0, "trend_alerts": 1})
    return doc.get("trend_alerts", {}) if doc else {}


@router.get("/api/health")
def health():
    return {"status": "ok", "message": "ACVIS API is running"}


# ─── Tickets ───
@router.post("/api/tickets", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, user=Depends(require_user)):
    import uuid
    ticket_id = f"TKT-{str(uuid.uuid4())[:8].upper()}"
    new_ticket = {
        "ticket_id": ticket_id,
        "subject": ticket.subject,
        "description": ticket.description,
        "category": ticket.category,
        "status": "open",
        "user_email": user["email"],
        "created_at": datetime.utcnow().isoformat(),
        "resolved_at": None,
        "resolution_note": None
    }
    tickets.insert_one(new_ticket.copy())
    return new_ticket

@router.get("/api/tickets", response_model=list[TicketResponse])
async def get_tickets(user=Depends(get_current_user)):
    # If company, return all tickets. If user, return only their tickets.
    query = {} if user["role"] == "company" else {"user_email": user["email"]}
    cursor = tickets.find(query, {"_id": 0}).sort("created_at", -1)
    return list(cursor)

@router.get("/api/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str, user=Depends(get_current_user)):
    query = {"ticket_id": ticket_id}
    if user["role"] == "user":
        query["user_email"] = user["email"]
    
    ticket = tickets.find_one(query, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.patch("/api/tickets/{ticket_id}/resolve", response_model=TicketResponse)
async def resolve_ticket(ticket_id: str, update: TicketUpdate, user=Depends(require_company)):
    ticket = tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket["status"] == "resolved":
        raise HTTPException(status_code=400, detail="Ticket is already resolved")

    updated_data = {
        "status": "resolved",
        "resolved_at": datetime.utcnow().isoformat(),
        "resolution_note": update.resolution_note
    }
    
    tickets.update_one({"ticket_id": ticket_id}, {"$set": updated_data})
    
    # Return updated ticket
    updated_ticket = tickets.find_one({"ticket_id": ticket_id}, {"_id": 0})
    return updated_ticket
