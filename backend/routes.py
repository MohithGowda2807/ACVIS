from fastapi import APIRouter
from models import ReviewInput
from pipeline import run_pipeline

router = APIRouter()

@router.post("/analyze")
async def analyze(data: ReviewInput):
    result = run_pipeline(data.reviews)
    return result

@router.get("/health")
def health():
    return {"status": "ok"}