import os
from groq import Groq
from database import processed_reviews, insights, actions_col

client = None

def get_groq_client():
    global client
    if client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("[WARNING] GROQ_API_KEY not set. Chatbot will return mock responses.")
            return None
        client = Groq(api_key=api_key)
    return client

def retrieve_customer_context(query: str):
    # RAG lookup for customer: fetch recent reviews
    # In a real app, this would use vector search. Here we just grab some processed reviews.
    docs = list(processed_reviews.find({}, {"_id": 0, "clean_text": 1, "rating": 1}).limit(20))
    if not docs:
        return "No reviews available yet."
    
    context = "Here are some recent product reviews from other users:\n"
    for idx, doc in enumerate(docs):
        context += f"Review {idx+1} (Rating: {doc.get('rating')}): {doc.get('clean_text')}\n"
    return context

def retrieve_company_context(query: str):
    # RAG lookup for company: fetch insights, trends, and alerts
    db_insights = insights.find_one({}, {"_id": 0})
    db_actions = actions_col.find_one({}, {"_id": 0})
    
    if not db_insights and not db_actions:
        return "No analytics data available yet."
    
    context = "Here is the current state of our product analytics:\n\n"
    
    if db_insights:
        fs = db_insights.get("feature_sentiment", {})
        context += "Feature Sentiment Overview:\n"
        for feature, stats in list(fs.items())[:10]: # Top 10 features
            if feature != 'general':
                context += f"- {feature.capitalize()}: {stats.get('positive', 0)*100}% positive, {stats.get('negative', 0)*100}% negative, {stats.get('neutral', 0)*100}% neutral (Total mentions: {stats.get('total')})\n"
        
        preds = db_insights.get("predictions", {})
        context += f"\nPredictions:\n- Current Rating: {preds.get('current')}\n- Predicted Rating: {preds.get('predicted')}\n- Trend: {preds.get('trend')}\n"

    if db_actions:
        alerts = db_actions.get("alerts", [])
        if alerts:
            context += "\nCritical Alerts:\n"
            for alert in alerts[:5]:
                context += f"- [{alert.get('priority').upper()}] {alert.get('message')}: {alert.get('reason')}\n"
                
        rev = db_actions.get("revenue_impact", {})
        if rev:
            context += f"\nRevenue Impact:\n- Monthly Loss Exposure: ${rev.get('loss')}\n- Churn Increase: {rev.get('churn_increase')}%\n- Top Liability Feature: {rev.get('top_liability')}\n"
            
    return context

def get_chatbot_response(user_message: str, portal: str) -> str:
    groq_client = get_groq_client()
    
    if not groq_client:
        return "Chatbot is currently offline (GROQ_API_KEY is not set). Please configure the backend."
        
    try:
        if portal == "user":
            system_prompt = "You are a helpful customer support and AI assistant for the ACVIS ecommerce platform. Answer the user's questions about the product based ONLY on the following context derived from other user's reviews. If the answer is not in the context, politely say you don't have enough data yet. Do not mention that you are reading reviews or context directly.\n\nContext:\n"
            system_prompt += retrieve_customer_context(user_message)
        else:
            system_prompt = "You are an expert AI business analyst for the ACVIS platform. You help company executives understand product health, sentiment trends, and revenue impacts based on the following analytics data. Answer clearly and professionally. Point out critical issues if relevant. Highlight financial impacts.\n\nContext:\n"
            system_prompt += retrieve_company_context(user_message)
            
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=600,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Chatbot error: {e}")
        return f"Sorry, I encountered an error while processing your request: {e}"
