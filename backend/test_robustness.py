from nlp_engine import score_sentiment

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

if __name__ == "__main__":
    try:
        test_robust_sentiment()
    except AssertionError as e:
        print(f"\n[FAILURE] {e}")
        sys.exit(1)
