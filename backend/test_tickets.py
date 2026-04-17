import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(".env")
client = MongoClient(os.environ["MONGO_URI"])
db = client["acvis"]
tickets = list(db.tickets.find({}, {"_id":0}))
print(f"Number of tickets: {len(tickets)}")
