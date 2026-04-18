import time
import os
import sys
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

# Add backend to path to import nlp_engine
sys.path.append(os.path.join(os.getcwd(), 'backend'))
import nlp_engine

def mock_reviews(n=100, is_english=True):
    if is_english:
        text = "Battery drains too fast after the update. Camera quality is amazing in portrait mode. UI feels laggy and unresponsive."
    else:
        text = "C'est une excellente application, j'aime beaucoup l'interface."
    return [{"review_id": str(i), "text": text} for i in range(n)]

def test_preprocess_sequential(reviews):
    start = time.time()
    for r in reviews:
        nlp_engine.preprocess_single(r)
    return time.time() - start

def test_analyze_sequential(reviews):
    # Preprocess first
    processed = [nlp_engine.preprocess_single(r) for r in reviews]
    start = time.time()
    for p in processed:
        nlp_engine.analyze_single(p)
    return time.time() - start

if __name__ == "__main__":
    n = 100
    
    print(f"--- Testing with {n} ENGLISH reviews ---")
    reviews_en = mock_reviews(n, is_english=True)
    
    t_pre_en = test_preprocess_sequential(reviews_en)
    print(f"Preprocess Sequential: {t_pre_en:.4f}s")
    
    t_ana_en = test_analyze_sequential(reviews_en)
    print(f"Analyze Sequential: {t_ana_en:.4f}s")
    
    print(f"\n--- Testing with {n} NON-ENGLISH reviews ---")
    reviews_fr = mock_reviews(n, is_english=False)
    
    t_pre_fr = test_preprocess_sequential(reviews_fr)
    print(f"Preprocess Sequential: {t_pre_fr:.4f}s")
    
    t_ana_fr = test_analyze_sequential(reviews_fr)
    print(f"Analyze Sequential: {t_ana_fr:.4f}s")
