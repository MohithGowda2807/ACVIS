from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["acvis"]

raw_reviews = db["raw_reviews"]
processed_reviews = db["processed_reviews"]
ai_outputs = db["ai_outputs"]
insights = db["insights"]
actions = db["actions"]

def test_connection():
    db.command("ping")
    print("✅ MongoDB connected!")