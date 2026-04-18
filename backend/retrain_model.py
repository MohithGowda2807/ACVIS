import json
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

def retrain_model():
    print("Loading dataset...")
    # Load the Amazon reviews sample from the project root
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'amazon_reviews_sample.json')
    
    with open(data_path, 'r', encoding='utf-8') as f:
        reviews = json.load(f)

    texts = []
    labels = []

    print(f"Loaded {len(reviews)} reviews. Preparing data...")
    for r in reviews:
        if 'text' in r and 'rating' in r:
            text = r['text']
            # rating >= 4 is positive (1), else negative (0)
            label = 1 if r['rating'] >= 4 else 0
            texts.append(text)
            labels.append(label)

    print(f"Training ML model on {len(texts)} samples...")
    # Create a simple NLP pipeline: Text -> TF-IDF -> Logistic Regression
    model = make_pipeline(TfidfVectorizer(max_features=5000), LogisticRegression())
    
    model.fit(texts, labels)

    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), 'sentiment_model.pkl')
    joblib.dump(model, model_path)
    
    print(f"[OK] Successfully trained and saved new model to {model_path}")
    
    # Test a prediction
    test_text = "This phone is absolutely amazing and the battery lasts forever!"
    pred = model.predict([test_text])[0]
    print(f"Test Prediction on positive text: {'Positive' if pred == 1 else 'Negative'}")

if __name__ == "__main__":
    retrain_model()
