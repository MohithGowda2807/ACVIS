from pymongo import MongoClient, ASCENDING
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from pathlib import Path
import os
import sys
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().with_name(".env"))

MONGO_URI = os.getenv("MONGO_URI")


class InMemoryCursor:
    """Minimal stand-in for a pymongo Cursor, supporting chainable .sort()."""

    def __init__(self, docs: list[dict]):
        self._docs = docs

    def sort(self, key_or_list, direction=None):
        if isinstance(key_or_list, list):
            field, order = key_or_list[0]
        else:
            field = key_or_list
            order = direction or 1

        reverse = (order == -1)
        
        try:
            # Simple sorting by field, handling missing values
            self._docs.sort(key=lambda x: x.get(field, ""), reverse=reverse)
        except Exception:
            pass
            
        return self

    def __iter__(self):
        return iter(self._docs)

    def __getitem__(self, index):
        return self._docs[index]

    def limit(self, n):
        self._docs = self._docs[:n]
        return self


class InMemoryCollection:
    """Minimal dict-backed stand-in for a pymongo Collection."""

    def __init__(self, name: str):
        self._name = name
        self._docs: list[dict] = []
        self._counter = 0

    # --- write ---
    def insert_one(self, doc: dict):
        self._counter += 1
        doc.setdefault("_id", self._counter)
        self._docs.append(doc)

        class _Result:
            inserted_id = doc["_id"]

        return _Result()

    def insert_many(self, docs: list[dict]):
        for d in docs:
            self.insert_one(d)

    # --- read ---
    def find_one(self, filter: dict | None = None, projection: dict | None = None):
        for doc in self._docs:
            if self._matches(doc, filter or {}):
                return self._project(doc, projection)
        return None

    def find(self, filter: dict | None = None, projection: dict | None = None):
        results = []
        for doc in self._docs:
            if self._matches(doc, filter or {}):
                results.append(self._project(doc, projection))
        return InMemoryCursor(results)

    def count_documents(self, filter: dict | None = None):
        if not filter:
            return len(self._docs)
        return sum(1 for d in self._docs if self._matches(d, filter))

    # --- write (update / delete) ---
    def update_one(self, filter: dict, update: dict, upsert: bool = False):
        for doc in self._docs:
            if self._matches(doc, filter):
                if "$set" in update:
                    doc.update(update["$set"])
                return
        if upsert and "$set" in update:
            new_doc = {**filter, **update["$set"]}
            self.insert_one(new_doc)

    def delete_one(self, filter: dict):
        for i, doc in enumerate(self._docs):
            if self._matches(doc, filter):
                self._docs.pop(i)
                return

    def delete_many(self, filter: dict):
        self._docs = [d for d in self._docs if not self._matches(d, filter)]

    # --- indexes (no-op) ---
    def create_index(self, *args, **kwargs):
        pass

    # --- helpers ---
    @staticmethod
    def _matches(doc: dict, filter: dict) -> bool:
        for k, v in filter.items():
            if doc.get(k) != v:
                return False
        return True

    @staticmethod
    def _project(doc: dict, projection: dict | None) -> dict:
        if not projection:
            return dict(doc)
        out = {}
        exclude_id = projection.get("_id", 1) == 0
        for key, include in projection.items():
            if key == "_id":
                continue
            if include:
                if key in doc:
                    out[key] = doc[key]
        if not exclude_id and "_id" in doc:
            out["_id"] = doc["_id"]
        return out


class InMemoryDB:
    """Minimal stand-in for pymongo Database."""

    def __init__(self):
        self._collections: dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]

    def command(self, cmd: str):
        return {"ok": 1}


# ─── Connect to real MongoDB or fall back to in-memory ───
if MONGO_URI:
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
        # We don't ping here anymore, it's done in ensure_db_setup()
        USE_MONGO = True
        db = client["acvis"]
        print("[OK] MongoDB client initialized (lazy connection)")
    except Exception as e:
        print(f"[WARNING] MongoDB initialization failed: {e}")
        db = InMemoryDB()
else:
    db = InMemoryDB()

# Collections
raw_reviews = db["raw_reviews"]
processed_reviews = db["processed_reviews"]
ai_outputs = db["ai_outputs"]
insights = db["insights"]
actions_col = db["actions"]
users = db["users"]
tickets = db["tickets"]

_db_initialized = False

def ensure_db_setup():
    """Run one-time setup (ping and indexes). Only runs once per process."""
    global _db_initialized
    if _db_initialized:
        return
    
    if USE_MONGO:
        try:
            client.admin.command("ping")
            print("[OK] MongoDB ping successful")
        except Exception as e:
            print(f"[WARNING] Lazy ping failed: {e}")

    # Indexes (no-op for in-memory, lazy for Mongo)
    try:
        raw_reviews.create_index([("review_id", ASCENDING)], unique=True, sparse=True)
        processed_reviews.create_index([("review_id", ASCENDING)], unique=True, sparse=True)
        ai_outputs.create_index([("review_id", ASCENDING)], unique=True, sparse=True)
        users.create_index([("email", ASCENDING)], unique=True)
        tickets.create_index([("ticket_id", ASCENDING)], unique=True)
        tickets.create_index([("user_email", ASCENDING)])
    except Exception as e:
        print(f"[WARNING] Index creation deferred: {e}")
    
    _db_initialized = True


def test_connection():
    ensure_db_setup()
    if USE_MONGO:
        client.admin.command("ping")
        print("[OK] Database connection verified!")
    else:
        print("[OK] In-memory database ready!")
