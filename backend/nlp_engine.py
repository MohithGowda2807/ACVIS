"""
ACVIS NLP Engine — Python port of frontend/src/lib/engine.ts
Full pipeline: ingestion → preprocessing → NLP → insights → decisions
"""
import re
import hashlib
from typing import Dict, List, Any, Optional, Tuple
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'sentiment_model.pkl')
try:
    sentiment_model = joblib.load(MODEL_PATH)
    print(f"[OK] ML model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"[WARNING] Could not load ML model: {e}")
    sentiment_model = None


# ─── Aspect Aliases ───
ASPECT_ALIASES = {
    "battery": ["battery", "charging", "charge", "power", "drain", "mah", "backup"],
    "camera": ["camera", "photo", "video", "lens", "selfie", "portrait", "zoom", "night mode", "picture"],
    "ui": ["ui", "interface", "design", "theme", "layout", "menu", "navigation", "ux", "one ui", "oneui", "miui"],
    "performance": ["performance", "speed", "lag", "slow", "fast", "smooth", "hang", "freeze", "ram", "processor", "snapdragon", "chipset"],
    "display": ["display", "screen", "amoled", "lcd", "brightness", "refresh rate", "resolution", "hdr"],
    "audio": ["audio", "speaker", "sound", "volume", "bass", "dolby", "earphone", "mic"],
    "storage": ["storage", "memory", "gb", "space", "expandable"],
    "connectivity": ["wifi", "bluetooth", "network", "5g", "4g", "signal", "gps", "nfc"],
    "durability": ["build", "quality", "gorilla", "scratch", "drop", "water", "dust", "ip68", "durable"],
    "software": ["software", "update", "os", "android", "ios", "bug", "crash", "app", "bloatware", "ads"],
    "price": ["price", "value", "cost", "worth", "expensive", "cheap", "budget", "premium", "money"],
    "support": ["support", "service", "warranty", "customer care", "helpline"],
    "heating": ["heat", "hot", "warm", "thermal", "overheat", "temperature"],
    "fingerprint": ["fingerprint", "face unlock", "biometric", "face id", "sensor"],
    "delivery": ["delivery", "shipping", "arrived", "package", "courier", "shipped", "dispatch", "packaging"],
    "general": ["phone", "device", "product", "mobile", "handset"],
}

POSITIVE_WORDS = [
    "good", "great", "excellent", "amazing", "awesome", "love", "best",
    "perfect", "fantastic", "wonderful", "impressive", "superb", "smooth",
    "fast", "beautiful", "brilliant", "outstanding", "solid", "premium",
    "clear", "bright", "sharp", "reliable", "crisp", "stunning",
    "satisfied", "happy", "recommend", "worth", "improved", "responsive",
    "convenient", "comfortable", "enjoy", "effortless", "intuitive",
    "sleek", "elegant", "top-notch", "exceptional", "flawless",
]

NEG_STRICT = [
    "worst", "terrible", "horrible", "awful", "trash", "garbage", "pathetic", 
    "disgusting", "useless", "waste", "broken", "dead", "scam", "avoid", "fraud",
    "stolen", "unusable", "fails", "fail"
]

NEGATIVE_WORDS = [
    "bad", "poor", "hate", "slow", "lag", "hang", "crash", "freeze", "drain", 
    "disappointed", "underwhelmed", "unhappy", "overpriced", "ugly", "cheap",
    "blurry", "dim", "weak", "noisy", "bloated", "heavy", "annoying",
    "frustrating", "mediocre", "regret", "refund", "issue", "problems",
    "problem", "defect", "malfunction", "unresponsive", "glitch", "stutter", 
    "overheat", "overheating", "broken", "unreliable", "slowly", "wasted",
    "stupid", "idiotic", "dumb", "useless", "pointless", "disappointing",
    "poorly", "low", "minimal", "none", "zero", "nothing", "don't buy", "avoid"
]

SARCASM_PATTERNS = [
    re.compile(r"great.{0,10}(crash|lag|freeze|drain|die|fail|broke)", re.I),
    re.compile(r"love.{0,10}(crash|lag|waiting|buffer|freeze|bug)", re.I),
    re.compile(r"amazing.{0,10}(slow|lag|drain|crash|heat|bug)", re.I),
    re.compile(r"wow.{0,10}(bad|poor|terrible|slow|crash)", re.I),
    re.compile(r"fantastic.{0,10}(lag|crash|drain|hang|bug)", re.I),
    re.compile(r"perfect.{0,10}(crash|fail|bug|freeze|drain)", re.I),
    re.compile(r"thank.{0,10}(nothing|waste|ruin|destroy|break)", re.I),
    re.compile(r"best.{0,10}(joke|waste|mistake|worst|never)", re.I),
]

EMOTION_KEYWORDS = {
    "anger": ["angry", "furious", "hate", "rage", "livid", "worst", "trash", "garbage", "pathetic", "disgusting", "scam"],
    "frustration": ["frustrat", "annoying", "irritat", "disappoint", "tire", "sick of", "fed up", "can't believe", "regret", "useless", "waste"],
    "satisfaction": ["happy", "satisfied", "love", "enjoy", "pleased", "delight", "glad", "recommend", "impress", "perfect", "thank"],
}

ROOT_CAUSE_KEYWORDS = ["update", "patch", "firmware", "version", "v2", "v3", "latest", "recent", "after", "since", "new", "changed"]

CONTRACTIONS = {
    "can't": "cannot", "won't": "will not", "don't": "do not",
    "doesn't": "does not", "isn't": "is not", "aren't": "are not",
    "wasn't": "was not", "weren't": "were not", "haven't": "have not",
    "hasn't": "has not", "didn't": "did not", "couldn't": "could not",
    "shouldn't": "should not", "wouldn't": "would not", "i'm": "i am",
    "it's": "it is", "that's": "that is", "there's": "there is",
    "they're": "they are", "we're": "we are", "you're": "you are",
    "i've": "i have", "you've": "you have", "we've": "we have",
    "they've": "they have", "i'll": "i will", "you'll": "you will",
    "he'll": "he will", "she'll": "she will", "we'll": "we will",
    "they'll": "they will", "i'd": "i would", "you'd": "you would",
    "he'd": "he would", "she'd": "she would", "we'd": "we would",
    "they'd": "they would", "let's": "let us",
}

SLANG_MAP = {
    "u": "you", "ur": "your", "r": "are", "pls": "please",
    "plz": "please", "thx": "thanks", "ty": "thank you",
    "tbh": "to be honest", "imo": "in my opinion",
    "bc": "because", "w/": "with", "w/o": "without",
    "gonna": "going to", "wanna": "want to", "gotta": "got to",
    "kinda": "kind of", "sorta": "sort of",
}

BUSINESS_CONFIG = {
    "total_users": 5_000_000,
    "arpu_monthly": 149,
    "churn_per_rating_drop": 0.08,
    "spike_threshold": 2.0,
    "currency_multiplier": 10_000_000,
}

STOPWORDS = {
    "this", "that", "with", "from", "have", "been", "were", "they",
    "their", "will", "would", "could", "should", "about", "after",
    "before", "very", "really", "much", "some", "also", "just",
    "than", "then", "when", "what", "which", "where", "there",
    "here", "your", "more", "most", "does", "doing", "each", "every",
}


def capitalize(s: str) -> str:
    return s[0].upper() + s[1:] if s else ""


# ─── 1. Ingestion ───
def ingest_reviews(reviews: List[dict]) -> List[dict]:
    seen = set()
    result = []
    for i, r in enumerate(reviews):
        text = (r.get("text") or "").strip()
        if not text:
            continue
        h = text.lower()
        if h in seen:
            continue
        seen.add(h)
        from datetime import datetime
        import uuid
        result.append({
            "review_id": r.get("review_id") or str(uuid.uuid4()),
            "text": text,
            "rating": r.get("rating"),
            "timestamp": r.get("timestamp") or datetime.utcnow().isoformat(),
            "source": r.get("source") or "unknown",
        })
    return result


# ─── 2. Preprocessing ───
def clean_text(text: str) -> str:
    t = text.lower()
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"<[^>]*>", "", t)
    t = re.sub(r"[^\w\s'.,!?-]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def expand_contractions(text: str) -> str:
    for c, e in CONTRACTIONS.items():
        text = re.sub(rf"\b{re.escape(c)}\b", e, text, flags=re.I)
    return text


def map_slang(text: str) -> str:
    words = text.split()
    return " ".join(SLANG_MAP.get(w, w) for w in words)


def detect_language(text: str) -> str:
    try:
        from langdetect import detect
        return detect(text)
    except Exception:
        return "en"


def preprocess_all(raw_reviews: List[dict]) -> List[dict]:
    result = []
    for r in raw_reviews:
        t = clean_text(r["text"])
        t = expand_contractions(t)
        t = map_slang(t)
        lang = detect_language(t)
        result.append({
            "review_id": r["review_id"],
            "original_text": r["text"],
            "clean_text": t,
            "language": lang,
            "rating": r.get("rating"),
            "timestamp": r.get("timestamp"),
            "source": r.get("source"),
        })
    return result


# ─── 3. NLP Analysis ───
def extract_aspects(text: str) -> List[str]:
    found = []
    for aspect, keywords in ASPECT_ALIASES.items():
        for kw in keywords:
            if kw in text:
                found.append(aspect)
                break
    return found if found else ["general"]


def score_sentiment(text: str, rating: Optional[float] = None) -> str:
    """
    Hybrid Sentiment Engine:
    1. Rating Priority: If rating is 1 or 2 -> Negative. If 4 or 5 -> Positive.
    2. Strict Keyword Override: If text contains critical negative words, it's Negative.
    3. Keyword Score: Weighted word counting.
    4. Sarcasm Check
    5. ML Model Fallback (with weight)
    """
    # 1. Numerical Rating Correlation
    if rating is not None:
        if rating <= 2: return "negative"
        if rating >= 4: return "positive"

    text_lower = text.lower()
    
    # 2. Strict Negative Keywords (Bypass ML)
    if any(w in text_lower for w in NEG_STRICT):
        return "negative"
        
    # 3. Keyword Scoring
    # Strip punctuation from words for dictionary matching
    words = [re.sub(r"[.,!?-]", "", w) for w in text_lower.split()]
    pos = sum(1.5 for w in words if w in POSITIVE_WORDS)
    neg = sum(1.5 for w in words if w in NEGATIVE_WORDS)
    
    # 4. Sarcasm Adjustment
    is_sarcastic = any(p.search(text_lower) for p in SARCASM_PATTERNS)
    if is_sarcastic:
        neg += 2 # Add weight to negative
        pos = 0

    # 5. ML Model Logic (Only if keywords are not definitive)
    ml_sentiment = None
    if sentiment_model:
        try:
            pred = sentiment_model.predict([text_lower])[0]
            ml_sentiment = "positive" if pred == 1 else "negative"
            # Add to scores instead of absolute return
            if ml_sentiment == "positive": pos += 1
            else: neg += 1
        except Exception:
            pass

    # Final Decision
    if neg > pos: return "negative"
    if pos > neg: return "positive"
    return "neutral"


def detect_emotion(text: str) -> str:
    for emotion, keywords in EMOTION_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                return emotion
    return "neutral"


def extract_keywords(text: str) -> List[str]:
    words = [w for w in text.split() if len(w) > 3]
    all_known = set(POSITIVE_WORDS + NEGATIVE_WORDS)
    for kws in ASPECT_ALIASES.values():
        all_known.update(kws)
    return [w for w in words if w not in STOPWORDS and w not in all_known][:5]


def analyze_all(processed_reviews: List[dict]) -> List[dict]:
    result = []
    for r in processed_reviews:
        text = r["clean_text"]
        rating = r.get("rating")
        aspects = extract_aspects(text)
        sentiment = score_sentiment(text, rating)
        aspect_sentiment = {a: sentiment for a in aspects}
        emotion = detect_emotion(text)
        keywords = extract_keywords(text)
        
        result.append({
            "review_id": r["review_id"],
            "aspects": aspects,
            "aspect_sentiment": aspect_sentiment,
            "emotion": emotion,
            "keywords": keywords,
            "rating": rating,
            "timestamp": r.get("timestamp"),
            "source": r.get("source"),
        })
    return result


# ─── 4. Aggregation ───
def aggregate_feature_sentiment(ai_outputs: List[dict]) -> Dict[str, dict]:
    fs: Dict[str, dict] = {}
    for out in ai_outputs:
        for aspect, sent in out["aspect_sentiment"].items():
            if aspect not in fs:
                fs[aspect] = {"positive": 0, "negative": 0, "neutral": 0, "total": 0}
            fs[aspect][sent] += 1
            fs[aspect]["total"] += 1
    # Convert to ratios
    for f in fs:
        t = fs[f]["total"]
        if t > 0:
            fs[f]["positive"] = round(fs[f]["positive"] / t, 4)
            fs[f]["negative"] = round(fs[f]["negative"] / t, 4)
            fs[f]["neutral"] = round(fs[f]["neutral"] / t, 4)
    return fs


def aggregate_trends(ai_outputs: List[dict]) -> Dict[str, Dict[str, dict]]:
    trends: Dict[str, Dict[str, dict]] = {}
    for out in ai_outputs:
        day = (out.get("timestamp") or "unknown").split("T")[0]
        for aspect, sent in out["aspect_sentiment"].items():
            if aspect not in trends:
                trends[aspect] = {}
            if day not in trends[aspect]:
                trends[aspect][day] = {"positive": 0, "negative": 0, "neutral": 0, "total": 0}
            trends[aspect][day][sent] += 1
            trends[aspect][day]["total"] += 1
    return trends


def detect_spikes(trends: Dict[str, Dict[str, dict]]) -> Dict[str, dict]:
    threshold = BUSINESS_CONFIG["spike_threshold"]
    alerts = {}
    for feature, days in trends.items():
        sorted_days = sorted(days.keys())
        if len(sorted_days) < 3:
            continue
        for i in range(2, len(sorted_days)):
            prev = sorted_days[max(0, i - 3):i]
            avg = sum(days[d]["negative"] for d in prev) / len(prev) if prev else 0
            current = days[sorted_days[i]]["negative"]
            if avg > 0 and current >= avg * threshold:
                alerts[feature] = {"day": sorted_days[i], "current": current, "avg": f"{avg:.1f}"}
    return alerts


def identify_root_causes(ai_outputs: List[dict], processed_reviews: List[dict]) -> Dict[str, Dict[str, int]]:
    proc_map = {r["review_id"]: r for r in processed_reviews}
    root_causes: Dict[str, Dict[str, int]] = {}
    for out in ai_outputs:
        for aspect, sent in out["aspect_sentiment"].items():
            if sent != "negative":
                continue
            proc = proc_map.get(out["review_id"])
            if not proc:
                continue
            for kw in ROOT_CAUSE_KEYWORDS:
                if kw in proc["clean_text"]:
                    if aspect not in root_causes:
                        root_causes[aspect] = {}
                    root_causes[aspect][kw] = root_causes[aspect].get(kw, 0) + 1
    return root_causes


def aggregate_emotions(ai_outputs: List[dict]) -> Dict[str, int]:
    emotions = {"anger": 0, "frustration": 0, "satisfaction": 0, "neutral": 0}
    for out in ai_outputs:
        e = out.get("emotion", "neutral")
        emotions[e] = emotions.get(e, 0) + 1
    return emotions


def compute_predictions(ai_outputs: List[dict]) -> dict:
    ratings = [o["rating"] for o in ai_outputs if o.get("rating")]
    if len(ratings) < 4:
        return {"current": 0, "predicted": 0, "trend": "stable", "slope": 0}
    mid = len(ratings) // 2
    first_half = sum(ratings[:mid]) / mid
    second_half = sum(ratings[mid:]) / (len(ratings) - mid)
    slope = round(second_half - first_half, 2)
    current = round(sum(ratings) / len(ratings), 1)
    predicted = round(max(1, min(5, current + slope)), 1)
    trend = "declining" if slope < -0.2 else ("improving" if slope > 0.2 else "stable")
    return {"current": current, "predicted": predicted, "trend": trend, "slope": slope}


# ─── 5. Decision Engine ───
def generate_decisions(feature_sentiment, trend_alerts, root_causes, predictions):
    actions = []
    alerts = []

    for feature, stats in feature_sentiment.items():
        if feature == "general":
            continue
        if stats["negative"] > 0.6:
            pct = round(stats["negative"] * 100)
            alerts.append({"priority": "critical", "feature": feature,
                           "message": f"{capitalize(feature)} has {pct}% negative sentiment",
                           "reason": f"Exceeds 60% negative threshold across {stats['total']} reviews"})
            actions.append({"priority": "critical", "feature": feature,
                            "action": f"Immediately investigate and fix {feature} issues",
                            "reason": f"Critical negative sentiment at {pct}%"})
        if feature in trend_alerts:
            spike = trend_alerts[feature]
            alerts.append({"priority": "high", "feature": feature,
                           "message": f"Complaint spike detected for {capitalize(feature)}",
                           "reason": f"{spike['current']} complaints on {spike['day']} (avg: {spike['avg']})"})
            actions.append({"priority": "high", "feature": feature,
                            "action": f"Investigate recent changes affecting {feature}",
                            "reason": f"Spike: {spike['current']} complaints vs avg {spike['avg']}"})
        if feature in root_causes:
            causes = sorted(root_causes[feature].items(), key=lambda x: x[1], reverse=True)
            if causes:
                actions.append({"priority": "high", "feature": feature,
                                "action": f"Review recent {causes[0][0]} related to {feature}",
                                "reason": f"{causes[0][1]} reviews mention \"{causes[0][0]}\" with negative {feature} sentiment"})
        if 0.3 < stats["negative"] <= 0.6:
            actions.append({"priority": "medium", "feature": feature,
                            "action": f"Monitor {feature} sentiment and plan improvements",
                            "reason": f"Moderate negative sentiment at {round(stats['negative'] * 100)}%"})
        if stats["positive"] > 0.7 and stats["total"] > 5:
            actions.append({"priority": "low", "feature": feature,
                            "action": f"Leverage {feature} as marketing strength",
                            "reason": f"High positive sentiment at {round(stats['positive'] * 100)}% across {stats['total']} reviews"})

    if predictions.get("trend") == "declining":
        alerts.append({"priority": "high", "feature": "overall",
                       "message": "Overall rating predicted to decline",
                       "reason": f"Current {predictions['current']} -> Predicted {predictions['predicted']}"})
        actions.append({"priority": "critical", "feature": "overall",
                        "action": "Prioritize product stability and bug fixes",
                        "reason": f"Rating decline from {predictions['current']} to {predictions['predicted']}"})

    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    actions.sort(key=lambda a: priority_order.get(a["priority"], 9))
    alerts.sort(key=lambda a: priority_order.get(a["priority"], 9))
    return {"actions": actions, "alerts": alerts}


# ─── 6. Revenue Impact ───
def calculate_revenue_impact(predictions, feature_sentiment, trend_alerts):
    cfg = BUSINESS_CONFIG
    current_rating = predictions.get("current") or 4.2
    predicted_rating = predictions.get("predicted") or current_rating
    rating_delta = max(0, current_rating - predicted_rating)
    churn_increase = rating_delta * cfg["churn_per_rating_drop"]
    total_monthly = cfg["total_users"] * cfg["arpu_monthly"]
    monthly_loss = total_monthly * churn_increase

    top_liability = "--"
    max_neg = -1
    for feature, stats in feature_sentiment.items():
        if feature == "general":
            continue
        impact = stats["negative"] * stats["total"]
        if feature in trend_alerts:
            impact *= 1.5
        if impact > max_neg:
            max_neg = impact
            top_liability = feature

    exposure = monthly_loss * (0.6 if max_neg > 0 else 0)
    mult = cfg["currency_multiplier"]
    return {
        "loss": round(monthly_loss / mult, 2),
        "churn_increase": round(churn_increase * 100, 2),
        "top_liability": top_liability,
        "exposure": round(exposure / mult, 2),
        "recovery": round(monthly_loss / mult, 2),
        "current_rating": current_rating,
        "predicted_rating": predicted_rating,
    }
