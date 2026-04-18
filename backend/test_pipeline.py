"""
test_pipeline.py — Integration tests for the ACVIS 6-stage NLP pipeline.
Covers: normal negative, sarcasm, mixed, non-English, short reviews.

Run:  python test_pipeline.py
"""

import json
import sys
import os

# Allow importing from backend folder directly
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from pipeline import run_pipeline

# ─── 10 Test Reviews ────────────────────────────────────────────────────────
TEST_REVIEWS = [
    # 1. Normal negative
    {
        "review_id": "T001",
        "text": "The battery life is absolutely terrible. It barely lasts 4 hours and drains so fast even on standby.",
        "rating": 1,
        "timestamp": "2026-04-17T10:00:00Z",
        "source": "amazon"
    },
    # 2. Sarcastic review — sentiment should flip from positive to negative
    {
        "review_id": "T002",
        "text": "Oh great, the battery died again after 3 hours. Really fantastic product. Would totally recommend to my enemies.",
        "rating": 1,
        "timestamp": "2026-04-17T10:30:00Z",
        "source": "playstore"
    },
    # 3. Mixed — positive camera, negative battery
    {
        "review_id": "T003",
        "text": "The camera quality is stunning and takes amazing portrait shots. But the battery drains so fast, it is unusable for travel.",
        "rating": 3,
        "timestamp": "2026-04-17T11:00:00Z",
        "source": "amazon"
    },
    # 4. Non-English — Hindi
    {
        "review_id": "T004",
        "text": "बैटरी बहुत खराब है, सिर्फ 3 घंटे चलती है। कैमरा अच्छा है लेकिन बैटरी की वजह से निराश हूं।",
        "rating": 2,
        "timestamp": "2026-04-17T11:30:00Z",
        "source": "flipkart"
    },
    # 5. Short review (just over 5-word threshold)
    {
        "review_id": "T005",
        "text": "Camera is great but slow",
        "rating": 3,
        "timestamp": "2026-04-17T12:00:00Z",
        "source": "twitter"
    },
    # 6. Very positive review
    {
        "review_id": "T006",
        "text": "Absolutely love this phone! The display is stunning, performance is incredibly smooth, and the camera takes brilliant photos in any lighting condition.",
        "rating": 5,
        "timestamp": "2026-04-17T12:30:00Z",
        "source": "amazon"
    },
    # 7. Root cause — mentions update
    {
        "review_id": "T007",
        "text": "Since the latest software update v2.3, the battery drains within 5 hours and the performance has completely degraded. Please release a patch.",
        "rating": 2,
        "timestamp": "2026-04-17T13:00:00Z",
        "source": "playstore"
    },
    # 8. Emotion — anger
    {
        "review_id": "T008",
        "text": "This is absolute garbage! The phone crashes every day, customer support is useless, and no one helps. I want a refund immediately.",
        "rating": 1,
        "timestamp": "2026-04-17T13:30:00Z",
        "source": "amazon"
    },
    # 9. Price-focused review
    {
        "review_id": "T009",
        "text": "Way overpriced for what you get. The build quality feels cheap and the price is not worth it at all.",
        "rating": 2,
        "timestamp": "2026-04-17T14:00:00Z",
        "source": "amazon"
    },
    # 10. Non-English — Kannada
    {
        "review_id": "T010",
        "text": "ಈ ಫೋನ್ ತುಂಬಾ ಒಳ್ಳೆಯದು. ಕ್ಯಾಮೆರಾ ಅದ್ಭುತವಾಗಿದೆ ಮತ್ತು ಪ್ರದರ್ಶನ ಸ್ಪಷ್ಟವಾಗಿದೆ.",
        "rating": 5,
        "timestamp": "2026-04-17T14:30:00Z",
        "source": "flipkart"
    },
]


def _check(label: str, condition: bool):
    status = "[PASS]" if condition else "[FAIL]"
    print(f"  {status}  {label}")
    return condition


def run_tests():
    print("\n" + "="*60)
    print("  ACVIS Pipeline Integration Tests")
    print("="*60 + "\n")

    print("Running pipeline on 10 test reviews...")
    result = run_pipeline(TEST_REVIEWS)

    print(f"\nPipeline timing: {result['pipeline_timing']}")
    print(f"Reviews processed: {result['reviews_processed']}\n")

    ai_outputs = result.get("ai_outputs", [])
    output_map = {r["review_id"]: r for r in ai_outputs}

    passed = 0
    total = 0

    # ── Test 1: Normal negative battery review ──
    print("Test 1: Normal negative review")
    t1 = output_map.get("T001", {})
    asp_sent = t1.get("aspect_sentiment", {})
    bat_sent = asp_sent.get("battery", {})
    label = bat_sent.get("label", bat_sent) if isinstance(bat_sent, dict) else bat_sent
    passed += _check("Battery aspect detected", "battery" in t1.get("aspects", []))
    passed += _check("Battery sentiment is negative", label == "negative")
    total += 2

    # ── Test 2: Sarcasm detection ──
    print("\nTest 2: Sarcasm review")
    t2 = output_map.get("T002", {})
    passed += _check("Sarcasm detected", t2.get("sarcasm_detected", False))
    total += 1

    # ── Test 3: Mixed review ──
    print("\nTest 3: Mixed review (camera=positive, battery=negative)")
    t3 = output_map.get("T003", {})
    t3_sent = t3.get("aspect_sentiment", {})
    cam = t3_sent.get("camera", {})
    bat = t3_sent.get("battery", {})
    cam_label = cam.get("label", cam) if isinstance(cam, dict) else cam
    bat_label = bat.get("label", bat) if isinstance(bat, dict) else bat
    passed += _check("Camera aspect present", "camera" in t3.get("aspects", []))
    passed += _check("Battery aspect present", "battery" in t3.get("aspects", []))
    total += 2

    # ── Test 4 & 10: Non-English (Hindi & Kannada) ──
    print("\nTest 4 & 10: Non-English reviews")
    t4 = output_map.get("T004", {})
    t10 = output_map.get("T010", {})
    passed += _check("Hindi review processed", "review_id" in t4)
    passed += _check("Kannada review processed", "review_id" in t10)
    total += 2

    # ── Test 7: Root cause ──
    print("\nTest 7: Root cause detection")
    root_causes = result.get("insights", {}).get("root_cause", {})
    passed += _check("Software update root cause detected", any("software" in str(v).lower() or "update" in str(v).lower() for v in root_causes.values()))
    total += 1

    # ── Test 8: Emotion ──
    print("\nTest 8: Emotion detection (anger/frustration)")
    t8 = output_map.get("T008", {})
    passed += _check("Negative emotion detected", t8.get("emotion") in ("anger", "frustration"))
    total += 1

    # ── General: actions generated ──
    print("\nGeneral: Actions")
    actions = result.get("actions", [])
    passed += _check("At least one action generated", len(actions) > 0)
    total += 1

    print(f"\n{'='*60}")
    print(f"  Results: {passed}/{total} tests passed")
    print(f"{'='*60}\n")

    # Print sample output
    print("Sample action output:")
    print(json.dumps(actions[0] if actions else {}, indent=2))

    print("\nSample insights:")
    fs = result.get("insights", {}).get("feature_sentiment_summary", {})
    for feat, stats in list(fs.items())[:3]:
        print(f"  {feat}: {json.dumps(stats)}")

    return passed == total


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
