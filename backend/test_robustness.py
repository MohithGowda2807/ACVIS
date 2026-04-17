import sys
import os

# Add backend to path
sys.path.append('backend')
from nlp_engine import score_sentiment, detect_fake_reviews

def test_robust_sentiment():
    print("Running Robust Sentiment Tests...")
    
    test_cases = [
        # Numerical Rating Priority
        ("I love it", 5, "positive"),
        ("It sucks", 1, "negative"),
        
        # Keyword Override (even if ML is positive)
        ("very bad!", None, "negative"),
        ("useless garbage", None, "negative"),
        ("complete waste of money", None, "negative"),
        ("stupid device", None, "negative"),
        
        # Sarcasm
        ("Great, another crash", None, "negative"),
        
        # Mixed
        ("The camera is amazing but the battery is worst", None, "negative"), # Worst should win
    ]
    
    for text, rating, expected in test_cases:
        actual = score_sentiment(text, rating)
        print(f"Text: '{text}' | Rating: {rating} | Expected: {expected} | Actual: {actual}")
        assert actual == expected, f"Failed for '{text}'"

    print("\n[SUCCESS] Sentiment tests passed!")

def test_loosened_fake_detection():
    print("\nRunning Loosened Fake Detection Tests...")
    
    test_reviews = [
        {
            "review_id": "legit_short",
            "original_text": "Very bad!",
            "clean_text": "very bad",
            "rating": 1
        },
        {
            "review_id": "legit_short_2",
            "original_text": "waste of money",
            "clean_text": "waste of money",
            "rating": 2
        },
        {
            "review_id": "bot_short",
            "original_text": "BAD!!!!!!", # Excessive symbols
            "clean_text": "bad",
            "rating": 1
        },
        {
            "review_id": "bot_dup",
            "original_text": "Very bad!",
            "clean_text": "very bad",
            "rating": 1
        }
    ]
    
    results = detect_fake_reviews(test_reviews)
    
    # Legit short reviews should now be FALSE
    print(f"Legit short 1 ('Very bad!'): {results[0]['is_fake']}")
    print(f"Legit short 2 ('waste of money'): {results[1]['is_fake']}")
    print(f"Bot short ('BAD!!!!!!'): {results[2]['is_fake']}")
    print(f"Bot dup: {results[3]['is_fake']}")
    
    assert not results[0]["is_fake"], "Short negative review should NOT be fake anymore"
    assert not results[1]["is_fake"], "Short negative review should NOT be fake anymore"
    assert results[2]["is_fake"], "Excessive symbols should still be fake"
    assert results[3]["is_fake"], "Duplicate should still be fake"
    
    print("\n[SUCCESS] Fake detection tests passed!")

if __name__ == "__main__":
    try:
        test_robust_sentiment()
        test_loosened_fake_detection()
    except AssertionError as e:
        print(f"\n[FAILURE] {e}")
        sys.exit(1)
