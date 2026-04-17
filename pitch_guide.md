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

3. **Show Decision Intelligence**:
   - Scroll to **Revenue Impact**. Say: *"We don't just show data; we show the price of inaction. Here, the battery spike is costing us ₹3.4 Cr this month."*
   - Scroll to **Action Recommendations**. Highlight the "Immediate Hotfix" for Battery.

4. **THE KILLER FEATURE: Competitor Intelligence**:
   - Go back to **Sample Data** and click **"🕵️ Competitor Data"**.
   - Show the **Benchmarking Card**.
   - Say: *"We can baseline our performance against Competitor X. While our battery sentiment is at 74% negative, theirs is at only 10%. We are literally losing our market share to them. This is the 'Aha!' moment for any CTO."*

## 4. Business ROI (Feasibility)
> "Our logic is defensible and actionable. By combining Sentiment Δ with Churn predictions, we estimate ACVIS can save a company like this roughly ₹1.4 Cr per month by reacting to regressions 3x faster than manual monitoring."

**Highlight:** The **Recovery Potential** stat.

---

## 🛡️ Defending the "Judge Traps" (Q&A)

**Q: How do you handle sarcasm?**
**A:** Our NLP Engine uses pattern flipping. For example, if a user says "Great, another crash", the system detects the "Great" + "Crash" proximity and flips the sentiment to negative.

**Q: Why not just use OpenAI/ChatGPT?**
**A:** Speed and privacy. ACVIS is designed to run locally or in secure clusters without sending sensitive customer data to 3rd party LLMs for every single review. Our rule-based NLP is 10x faster for real-time spikes.

**Q: How is the Revenue Loss calculated?**
**A:** We use a Churn Impact Model: (Rating Delta * 5% Multiplier) * ARPU * Total Users. It maps emotional sentiment to actual financial liability.

**Q: What about competitors?**
**A:** As just shown, we have a built-in Benchmarking Engine. We can ingest competitor data to tell you exactly where they are beating you in the market.

---

## 🏁 Final Tip for the Win:
When they ask you **"What's next?"**, tell them: 
"In the next round, we are implementing **What-If Simulations**. You'll be able to drag a slider to see: *'If we fix the Battery issue today, what is our projected rating in 30 days?'*" (This shows high execution readiness and vision).
