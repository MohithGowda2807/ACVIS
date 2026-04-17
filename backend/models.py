from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ─── Auth Models ───
class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "company"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    email: str
    role: str

# ─── Review Models ───
class Review(BaseModel):
    review_id: Optional[str] = None
    text: str
    rating: Optional[float] = None
    timestamp: Optional[str] = None
    source: Optional[str] = "unknown"

class ReviewInput(BaseModel):
    reviews: Optional[List[Review]] = None
    use_csv: Optional[bool] = False

# ─── Pipeline Output Models ───
class ProcessedReview(BaseModel):
    review_id: str
    original_text: str
    clean_text: str
    language: str = "en"
    rating: Optional[float] = None
    timestamp: Optional[str] = None
    source: Optional[str] = None

    is_fake: bool = False
    fake_reason: Optional[str] = None
    rating: Optional[float] = None
    timestamp: Optional[str] = None
    source: Optional[str] = None

class FeatureStats(BaseModel):
    positive: float = 0.0
    negative: float = 0.0
    neutral: float = 0.0
    total: int = 0

class AlertModel(BaseModel):
    priority: str
    feature: str
    message: str
    reason: str

class ActionModel(BaseModel):
    priority: str
    feature: str
    action: str
    reason: str

class SpikeInfo(BaseModel):
    day: str
    current: int
    avg: str

class PipelineResponse(BaseModel):
    status: str
    reviews_processed: int
    feature_sentiment: Dict[str, Any]
    predictions: Dict[str, Any]
    alerts: List[Dict[str, str]]
    actions: List[Dict[str, str]]
    trends: Dict[str, Any]
    root_causes: Dict[str, Any]
    emotions: Dict[str, int]
    revenue_impact: Dict[str, Any]
    fake_review_stats: Optional[Dict[str, Any]] = None

# ─── Ticket Models ───
class TicketCreate(BaseModel):
    subject: str
    description: str
    category: Optional[str] = "General"

class TicketUpdate(BaseModel):
    resolution_note: Optional[str] = ""

class TicketResponse(BaseModel):
    ticket_id: str
    subject: str
    description: str
    category: str
    status: str  # "open" | "resolved"
    user_email: str
    created_at: str
    resolved_at: Optional[str] = None
    resolution_note: Optional[str] = None