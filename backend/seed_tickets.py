import os
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid
import sys
from dotenv import load_dotenv

def seed_tickets():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    
    if not mongo_uri:
        print("[ERROR] MONGO_URI not found in .env")
        sys.exit(1)
        
    client = MongoClient(mongo_uri)
    db = client["acvis"]
    tickets_col = db["tickets"]
    
    # Check if we already have tickets
    if tickets_col.count_documents({}) > 0:
        print("Tickets already exist in the database. Clearing them...")
        tickets_col.delete_many({})
        
    now = datetime.utcnow()
    
    sample_tickets = [
        {
            "ticket_id": f"TKT-{str(uuid.uuid4())[:8].upper()}",
            "subject": "App keeps crashing after latest update",
            "description": "Ever since I updated to version 2.1 yesterday, the app crashes immediately when I try to open the camera feature. I'm using a Galaxy S23.",
            "category": "Technical Support",
            "status": "open",
            "user_email": "john.customer@example.com",
            "created_at": (now - timedelta(hours=5)).isoformat(),
            "resolved_at": None,
            "resolution_note": None
        },
        {
            "ticket_id": f"TKT-{str(uuid.uuid4())[:8].upper()}",
            "subject": "Missing items in my recent order",
            "description": "My package arrived today but the screen protector was missing from the box. The shipment slip says it was included.",
            "category": "General",
            "status": "open",
            "user_email": "sarah.w@example.com",
            "created_at": (now - timedelta(days=1, hours=2)).isoformat(),
            "resolved_at": None,
            "resolution_note": None
        },
        {
            "ticket_id": f"TKT-{str(uuid.uuid4())[:8].upper()}",
            "subject": "How do I export my review data?",
            "description": "I would like to export all the reviews I've submitted over the last year. Is there a way to download this as a CSV?",
            "category": "Feature Request",
            "status": "resolved",
            "user_email": "data.guy99@example.com",
            "created_at": (now - timedelta(days=5)).isoformat(),
            "resolved_at": (now - timedelta(days=3)).isoformat(),
            "resolution_note": "Hi! We've enabled the export feature on your account. You can now go to Settings > Data Export to download your CSV."
        },
        {
            "ticket_id": f"TKT-{str(uuid.uuid4())[:8].upper()}",
            "subject": "Double charge on my statement",
            "description": "I was charged twice for my subscription this month. $14.99 was taken out on the 1st and again on the 3rd.",
            "category": "Billing",
            "status": "open",
            "user_email": "angry.customer55@example.com",
            "created_at": (now - timedelta(minutes=45)).isoformat(),
            "resolved_at": None,
            "resolution_note": None
        }
    ]
    
    tickets_col.insert_many(sample_tickets)
    print(f"Successfully seeded {len(sample_tickets)} sample tickets into the database.")

if __name__ == "__main__":
    seed_tickets()
