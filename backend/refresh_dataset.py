import sys
import os
import json

# Add backend to path
sys.path.append('backend')

try:
    from pipeline import run_pipeline
    from routes import _load_amazon_reviews
    from database import insights, ai_outputs
except ImportError:
    # Fallback if run from different CWD
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from pipeline import run_pipeline
    from routes import _load_amazon_reviews
    from database import insights, ai_outputs

def refresh_data():
    print("Loading Amazon reviews (500)...")
    reviews = _load_amazon_reviews(500)
    print(f"Loaded {len(reviews)} reviews.")
    
    # Run full pipeline
    print("Running pipeline with fixed sentiment logic...")
    result = run_pipeline(reviews)
    
    print("\n--- Pipeline Result Summary ---")
    print(f"Status: {result['status']}")
    print(f"Reviews processed: {result['reviews_processed']}")
    
    fs = result['feature_sentiment']
    print("\nFeature Sentiment Ratios:")
    for feature, stats in fs.items():
        print(f"  {feature:12}: Pos: {stats['positive']:.2f} | Neg: {stats['negative']:.2f} | Total: {stats['total']}")
    
    fake_stats = result.get('fake_review_stats', {})
    print(f"\nFake Reviews: {fake_stats.get('fake_count', 0)} ({fake_stats.get('fake_percentage', 0)}%)")
    
    # Check if we have any negative sentiment
    total_neg = sum(stats['negative'] for stats in fs.values())
    if total_neg > 0:
        print("\n[SUCCESS] Negative reviews are now being identified!")
    else:
        print("\n[FAILURE] Still only positive reviews found inaggregation.")

if __name__ == "__main__":
    refresh_data()
