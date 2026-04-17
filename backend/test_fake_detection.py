import sys
import os
from typing import List

# Add the backend directory to the path so we can import from it
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from nlp_engine import detect_fake_reviews, score_sentiment
except ImportError:
    # If run from root
    sys.path.append('backend')
    from nlp_engine import detect_fake_reviews, score_sentiment

def test_fake_detection():
    test_reviews = [
        {
            "review_id": "1",
            "original_text": "Normal review about the battery. It lasts a long time and is stable.",
            "clean_text": "normal review about the battery. it lasts a long time and is stable."
        },
        {
            "review_id": "2",
            "original_text": "Normal review about the battery. It lasts a long time and is stable.",
            "clean_text": "normal review about the battery. it lasts a long time and is stable."
        },
        {
            "review_id": "3",
            "original_text": "GREAT!!!",
            "clean_text": "great"
        },
        {
            "review_id": "4",
            "original_text": "STUPID DEVICE!!!!!!!!!!!!!!",
            "clean_text": "stupid device"
        },
        {
            "review_id": "5",
            "original_text": "abcabcabcabcabcabc",
            "clean_text": "abcabcabcabcabcabc"
        },
        {
            "review_id": "6",
            "original_text": "I love the camera, it takes great photos.",
            "clean_text": "i love the camera, it takes great photos."
        }
    ]

    print("Running Fake Review Detection Test...")
    results = detect_fake_reviews(test_reviews)
    
    for i, res in enumerate(results):
        orig = test_reviews[i]["original_text"]
        is_fake = res["is_fake"]
        reason = res["fake_reason"]
        print(f"Review: {orig[:40]}... | Is Fake: {is_fake} | Reason: {reason}")

    # Assertions
    assert results[1]["is_fake"], "Review 2 should be a duplicate of Review 1"
    assert results[2]["is_fake"], "Review 3 should be a bot pattern (short & extreme)"
    assert results[3]["is_fake"], "Review 4 should be a spam pattern (excessive symbols)"
    assert results[4]["is_fake"], "Review 5 should be a spam pattern (repetition)"
    assert not results[0]["is_fake"], "Review 1 should be verified"
    assert not results[5]["is_fake"], "Review 6 should be verified"
    
    print("\n[SUCCESS] All test cases passed!")

if __name__ == "__main__":
    test_fake_detection()
