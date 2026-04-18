"""
database.py — MongoDB + Redis cache for ACVIS.

Merge strategy:
  - Team's full InMemoryCollection fallback (kept intact)
  - Team's ensure_db_setup() + index creation (kept intact)
  - Our Redis cache (cache_get / cache_set / cache_key) added on top
  - Our load_insights() helper added for routes.py
"""

from pymongo import MongoClient, ASCENDING
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from pathlib import Path
import os
import sys
import json
import hashlib
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().with_name(".env"))

logger = logging.getLogger("acvis.database")
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

    def find_one(self, filter: dict | None = None, projection: dict | None = None):
        for doc in self._docs:
            if self._matches(doc, filter or {}):
                return self._project(doc, projection)
        return None

    def find(self, filter: dict | None = None, projection: dict | None = None):
        results = [d for d in self._docs if self._matches(d, filter or {})]
        return InMemoryCursor([self._project(d, projection) for d in results])

    def count_documents(self, filter: dict | None = None):
        if not filter:
            return len(self._docs)
        return sum(1 for d in self._docs if self._matches(d, filter))

    def update_one(self, filter: dict, update: dict, upsert: bool = False):
        for doc in self._docs:
            if self._matches(doc, filter):
                if "$set" in update:
                    doc.update(update["$set"])
                return
        if upsert and "$set" in update:
            self.insert_one({**filter, **update["$set"]})

    def replace_one(self, filter: dict, replacement: dict, upsert: bool = False):
        for i, doc in enumerate(self._docs):
            if self._matches(doc, filter):
                self._docs[i] = replacement
                return
        if upsert:
            self.insert_one(replacement)

    def bulk_write(self, operations):
        for op in operations:
            if hasattr(op, "_filter") and hasattr(op, "_doc"):
                self.update_one(op._filter, {"$set": op._doc}, upsert=True)

    def delete_one(self, filter: dict):
        for i, doc in enumerate(self._docs):
            if self._matches(doc, filter):
                self._docs.pop(i)
                return

    def delete_many(self, filter: dict):
        self._docs = [d for d in self._docs if not self._matches(d, filter)]

    def create_index(self, *args, **kwargs):
        pass  # No-op for in-memory

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
            if include and key in doc:
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


# ─── Connect to real MongoDB or fall back to in-memory ────────────────────
USE_MONGO = False
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
        USE_MONGO = True
        db = client["acvis"]
        print("[OK] MongoDB client initialized (lazy connection)")
    except Exception as e:
        print(f"[WARNING] MongoDB initialization failed: {e}")
        db = InMemoryDB()
else:
    print("[INFO] No MONGO_URI — using in-memory database")
    db = InMemoryDB()

# Collections (direct references — usable by routes.py, chatbot.py, pipeline.py)
raw_reviews        = db["raw_reviews"]
processed_reviews  = db["processed_reviews"]
ai_outputs         = db["ai_outputs"]
insights           = db["insights"]
actions_col        = db["actions"]
users              = db["users"]
tickets            = db["tickets"]

_db_initialized = False


def ensure_db_setup():
    """Run one-time setup (ping + indexes). Only runs once per process."""
    global _db_initialized
    if _db_initialized:
        return

    if USE_MONGO:
        try:
            client.admin.command("ping")
            print("[OK] MongoDB ping successful")
        except Exception as e:
            print(f"[WARNING] Lazy ping failed: {e}")

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


def load_insights() -> Optional[dict]:
    """Helper for routes.py: load latest insights document."""
    try:
        doc = insights.find_one({}, {"_id": 0})
        return doc
    except Exception as e:
        logger.warning(f"Failed to load insights: {e}")
        return None


# ─── Redis Cache (optional — pipeline continues if unavailable) ───────────
_redis_client = None
_redis_attempted = False


def get_redis():
    """Try to connect to Redis once; returns None if unavailable."""
    global _redis_client, _redis_attempted
    if _redis_attempted:
        return _redis_client
    _redis_attempted = True
    try:
        import redis
        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", 6379))
        r = redis.Redis(host=host, port=port, db=0, socket_connect_timeout=2)
        r.ping()
        _redis_client = r
        logger.info("Redis connected")
    except Exception as e:
        logger.info(f"Redis unavailable (non-fatal): {e}")
        _redis_client = None
    return _redis_client


def cache_key(text: str) -> str:
    return "acvis:nlp:" + hashlib.md5(text.encode()).hexdigest()


def cache_get(text: str) -> Optional[dict]:
    r = get_redis()
    if r is None:
        return None
    try:
        val = r.get(cache_key(text))
        if val:
            return json.loads(val)
    except Exception:
        pass
    return None


def cache_set(text: str, result: dict, ttl_seconds: int = 86400):
    r = get_redis()
    if r is None:
        return
    try:
        r.setex(cache_key(text), ttl_seconds, json.dumps(result))
    except Exception:
        pass
