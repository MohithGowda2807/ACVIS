from fastapi import APIRouter, HTTPException, Depends
from models import ReviewInput, UserCreate, UserLogin, UserResponse, Token
from pipeline import run_pipeline
from database import users, insights, actions_col, raw_reviews, processed_reviews, ai_outputs
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from middleware import get_current_user, require_company
from datetime import timedelta
import logging

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
@router.post("/api/analyze")
async def analyze(data: ReviewInput, user=Depends(get_current_user)):
    try:
        result = run_pipeline(data.reviews)
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
    db_user = users.find_one({"email": user["sub"]}, {"_id": 0, "hashed_password": 0})
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