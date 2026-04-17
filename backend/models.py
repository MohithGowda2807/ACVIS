from pydantic import BaseModel
from typing import List, Optional

class Review(BaseModel):
    review_id: Optional[str] = None
    text: str
    rating: Optional[float] = None
    timestamp: Optional[str] = None
    source: Optional[str] = "unknown"

class ReviewInput(BaseModel):
    reviews: List[Review]