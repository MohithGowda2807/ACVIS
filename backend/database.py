from pymongo import MongoClient, ASCENDING
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from pathlib import Path
import os
import sys
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().with_name(".env"))

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("[ERROR] MONGO_URI not set in .env")
    sys.exit(1)

try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=10000,
        socketTimeoutMS=20000,
        retryWrites=True,
        retryReads=True,
        maxPoolSize=10,
    )
    client.admin.command("ping")
    print("[OK] MongoDB connected!")
except Exception as e:
    print(f"[WARNING] MongoDB initial connection issue: {e}")
    print("[INFO] Will retry on first request...")
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=10000,
        socketTimeoutMS=20000,
        retryWrites=True,
        retryReads=True,
        maxPoolSize=10,
    )

db = client["acvis"]

# Collections
raw_reviews = db["raw_reviews"]
processed_reviews = db["processed_reviews"]
ai_outputs = db["ai_outputs"]
insights = db["insights"]
actions_col = db["actions"]
users = db["users"]

# Indexes (lazy — won't fail if DB is temporarily unreachable)
try:
    raw_reviews.create_index([("review_id", ASCENDING)], unique=True, sparse=True)
    processed_reviews.create_index([("review_id", ASCENDING)], unique=True, sparse=True)
    ai_outputs.create_index([("review_id", ASCENDING)], unique=True, sparse=True)
    users.create_index([("email", ASCENDING)], unique=True)
except Exception as e:
    print(f"[WARNING] Index creation deferred: {e}")


def test_connection():
    db.command("ping")
    print("[OK] MongoDB connected!")
