from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

try:
    from .routes import router
except ImportError:
    from routes import router

app = FastAPI(title="ACVIS API", version="1.0.0")


def parse_cors_origins() -> list[str]:
    default_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8000",
    ]
    env_origins = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
        if origin.strip()
    ]
    return list(dict.fromkeys([*default_origins, *env_origins]))

# CORS — allow all origins for dev, specific ones for prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"status": "ACVIS backend running", "version": "1.0.0"}
