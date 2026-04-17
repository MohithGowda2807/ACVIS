# 🎤 ACVIS Pitch Guide — Mentor Round 1

Use this guide to structure your response to judges. Your goal is to prove **ACVIS** isn't just a sentiment analyzer; it's a **Decision Intelligent Platform**.

---

## 1. The Opening (Market Fit & Problem)
> "Judges, every company has thousands of reviews, but they all ask the same question: **'Which bug is actually losing us money?'** ACVIS doesn't just show sentiment; it acts as an Autonomous Customer Voice Intelligence System that turns raw text into financial risk assessments and engineering roadmaps."

**Highlight:** Point to the **Revenue Impact Card** immediately.

## 2. The Technical Approach (Architecture)
> "We've built a modular 5-stage pipeline. We don't just 'read' reviews. We **preprocess** to remove noise, use **NLP-based aspect extraction** to identify specific features (Battery, UI, Performance), and run a **Decision Engine** that generates specific business actions based on thresholds."

**Highlight:** Show the **Pipeline Visualizer** in the UI to demonstrate the engineering maturity.

## 3. The "Killer Demo" (Data Realism)
> "Look at our Trend Chart on **Day 5**. Our system detected a 240% spike in battery complaints. But here's the intelligence: The system linked this spike to the keyword 'v2.1 update' and automatically categorized it as **CRITICAL**. It didn't just tell us users are mad; it recommended an immediate hotfix within 48 hours."

**Highlight:** Hover over the **Red Spike Marker** on the trend chart and the **Critical Alert**.

## 4. Business ROI (Feasibility)
> "Our logic is defensible and actionable. By combining Sentiment Δ with Churn predictions, we estimate ACVIS can save a company like this roughly ₹1.4 Cr per month by reacting to regressions 3x faster than manual monitoring."

**Highlight:** The **Recovery Potential** stat.

---

## 5. Potential "Judge Trap" Questions & Your Answers

| Question | Your Winning Response |
| :--- | :--- |
| **"How do you handle sarcasm?"** | "We use a pattern-based 'flip' logic. If the system sees 'Great' linked with words like 'crash' or 'lag', it flips the sentiment from Positive to Negative. We also detect caps and exclamation density for intensity." |
| **"Why not just use ChatGPT/LLMs?"** | "We use a hybrid approach. LLMs are expensive and slow for batch processing. Our pipeline uses optimized local NLP layers for initial aspect/sentiment classification, allowing us to process thousands of reviews in seconds at scale." |
| **"How do you handle data noise?"** | "Our preprocessing stage expands slang (e.g., 'ngl' → 'not going to lie') and contractions. We also deduplicate reviews based on text hashes to prevent bot spam from skewing our metrics." |

---

## 🏁 Final Tip for the Win:
When they ask you **"What's next?"**, tell them: 
"In the next round, we are implementing **What-If Simulations**. You'll be able to drag a slider to see: *'If we fix the Battery issue today, what is our projected rating in 30 days?'*" (This shows high execution readiness and vision).
