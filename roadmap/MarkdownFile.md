**🧩 1. Problem & Output Definition**

**🔹 Introduction**

Modern digital platforms generate massive volumes of customer feedback across multiple channels such as e-commerce platforms, app stores, and social media. This feedback contains **critical signals about product quality, user satisfaction, and emerging issues**, but remains largely underutilized.

Existing analytics tools focus on:

*   Aggregate sentiment (positive/negative/neutral)
*   Static dashboards
*   Manual interpretation by teams

This creates a gap between **raw customer voice** and **real business action**.

👉 Our system, **ACVIS (Autonomous Customer Voice Intelligence System)**, bridges this gap by transforming unstructured reviews into **structured insights, predictive signals, and actionable decisions in real time**.

**🔴 Problem Statement**

Organizations today are **data-rich but insight-poor** when it comes to customer feedback.

**Key Problems:**

1.  **Lack of Feature-Level Visibility**
    *   Feedback is analyzed at a global level
    *   Companies cannot identify _which exact feature_ (battery, UI, performance) is failing
2.  **Delayed Issue Detection**
    *   Critical issues (e.g., app crashes after updates) are detected too late
    *   Leads to customer churn and negative brand impact
3.  **No Contextual Understanding**
    *   Traditional systems fail to interpret:
        *   Sarcasm (“Great, another crash 🙄”)
        *   Slang (“This phone is sick”)
        *   Multilingual inputs
4.  **No Actionable Intelligence**
    *   Insights are descriptive, not prescriptive
    *   Teams still need manual analysis to decide next steps
5.  **Reactive Instead of Predictive**
    *   No forecasting of future sentiment trends
    *   Businesses cannot proactively prevent issues

**🎯 Why We Are Solving This Problem**

*   Customer feedback is the **most direct signal of product health**
*   Faster interpretation = **faster product iteration**
*   Early issue detection = **reduced churn + better ratings**
*   Automated decisions = **reduced dependency on manual analysis**

👉 Goal:  
Convert **“Customer Voice → Real-Time Decisions → Business Impact”**

**💡 Novelty of the Project (What Makes It Different)**

Unlike traditional review analysis tools, ACVIS is not just an analytics platform — it is a **decision intelligence system**.

**Key Innovations:**

*   Moves from **sentiment analysis → decision automation**
*   Combines **NLP + time-series + rule-based intelligence**
*   Focuses on **feature-level granularity**, not overall ratings
*   Introduces **predictive + simulation capabilities**
*   Provides **explainable recommendations**, not black-box outputs

👉 In short:  
**From “What users feel” → to “What the business should do next”**

**📥 System Inputs**

The system accepts:

*   Customer reviews (text)
*   Ratings (optional)
*   Timestamps
*   Source platform (optional)

**Example Input:**

"Battery drains too fast after the latest update. Camera is amazing though!"  
Rating: 3⭐  
Date: 2026-04-01

**📤 System Outputs**

The system generates structured, actionable outputs:

**1\. Feature-Level Insights**

*   Battery → Negative
*   Camera → Positive

**2\. Alerts**

*   “Spike detected in battery complaints”

**3\. Root Cause Signals**

*   Linked to “latest update v2.1”

**4\. Predictions**

*   “Rating may drop from 4.2 → 3.6 in 2 weeks”

**5\. Action Recommendations**

*   “Release hotfix within 48 hours”
*   “Notify users proactively”

**⚙️ Core Features of the System**

Below are the **key features implemented in the platform**:

**1\. 🧬 Feature-Level Sentiment Analysis**

*   Extracts product aspects (battery, UI, camera)
*   Assigns sentiment per feature
*   Enables precise issue identification

**2\. ⏱️ Trend Spike Detection**

*   Tracks frequency of complaints over time
*   Detects sudden increases (anomalies)

**Example:**  
Crash-related reviews spike after update → trigger alert

**3\. 🌍 Multilingual & Context Understanding**

*   Handles:
    *   Mixed languages (Hinglish, etc.)
    *   Slang and sarcasm
*   Uses translation + contextual NLP

**4\. 🧠 Root Cause Identification**

*   Links complaints to possible causes

**Example:**  
“Battery drain” → “Update v2.1”

**5\. 🔮 Predictive Sentiment Forecasting**

*   Uses historical trends to predict:
    *   Rating drop
    *   Sentiment shift

**6\. 🧪 What-If Simulation Engine**

*   Simulates impact of decisions

**Example:**  
Fix battery → rating improves by +0.5

**7\. 🗂️ Auto-Generated Product Roadmap**

*   Converts insights into prioritized tasks

**Example Output:**

*   Priority 1: Fix battery issue
*   Priority 2: Optimize app performance

**8\. 🤖 AI Review Response Generator**

*   Generates contextual replies to users
*   Matches tone and issue

**9\. 🕵️ Fake Review Detection**

*   Identifies:
    *   Spam reviews
    *   Bot patterns

**10\. 🎯 Action Recommendation Engine (Core Feature)**

*   Converts insights → exact business actions

**Example:**

*   “Push hotfix within 48 hours”
*   “Send proactive notification”

**🧠 Developer Notes**

*   Focus implementation on:
    *   Feature Sentiment
    *   Trend Detection
    *   Action Engine
*   Keep inputs simple (static dataset is fine)
*   Outputs should feel **real-time and actionable**

# ⚙️ 2. Developer Notes — Core System Flow

## 🔁 High-Level Pipeline

Data → Processing → AI → Insights → Actions

👉 Treat each stage as a **separate logical module** (even if implemented in one codebase for hackathon speed).

# 🧩 1. Data Stage (Input Layer)

## What happens here:

*   System ingests raw review data

## Accepted Formats:

*   JSON (preferred)
*   CSV (batch upload)
*   API input (optional)

## Standard Input Schema:

{  
"review\_id": "string",  
"text": "string",  
"rating": 1-5,  
"timestamp": "ISO format",  
"source": "amazon | playstore | twitter"  
}

## Implementation Notes:

*   Use a **single ingestion function**
    *   ingest\_reviews(data)
*   Validate:
    *   Empty text
    *   Invalid ratings
*   Assign defaults if missing:
    *   rating = null
    *   source = "unknown"

## Storage (Raw Layer):

*   Store **unaltered data** in DB
*   Collection/Table: raw\_reviews

👉 **Important:** Never skip raw storage (helps debugging)

# 🧹 2. Processing Stage (Preprocessing Layer)

## Objective:

Convert messy text → clean, structured input for AI

## Steps (in order):

### 1\. Text Cleaning

*   Lowercase
*   Remove:
    *   URLs
    *   emojis (optional)
    *   special characters

clean\_text = preprocess(text)

### 2\. Normalization

*   Expand contractions:
    *   “don’t” → “do not”
*   Standardize slang (basic mapping)

### 3\. Deduplication

*   Hash text and remove duplicates
*   Prevent skewed insights

### 4\. Language Detection

*   Use lightweight lib:
    *   langdetect or fastText

### 5\. Translation (if needed)

*   Non-English → English
*   Use API:
    *   OpenAI / Google Translate

## Output Schema (Processed Data):

{  
"review\_id": "string",  
"clean\_text": "string",  
"language": "en",  
"timestamp": "...",  
}

## Storage:

*   Collection: processed\_reviews

👉 **Dev Rule:**  
Processing must be **idempotent** (safe to re-run)

# 🧠 3. AI Stage (NLP Engine)

## Objective:

Extract structured intelligence from text

## Core Tasks:

### 1\. Aspect (Feature) Extraction

*   Identify product components:
    *   battery, camera, UI

#### Approach:

*   LLM prompt OR keyword + embedding match

Extract product features mentioned in this review:  
"Battery is bad but camera is great"  
→ \["battery", "camera"\]

### 2\. Sentiment per Aspect

*   For each feature:
    *   assign sentiment: positive / negative / neutral

#### Example Output:

{  
"battery": "negative",  
"camera": "positive"  
}

### 3\. Emotion Detection (optional)

*   anger, frustration, satisfaction

### 4\. Keyword Extraction

*   Helps in trend detection

## Tools:

*   Preferred:
    *   OpenAI API (fast + accurate)
*   Backup:
    *   HuggingFace models

## Optimization:

*   Cache responses for repeated reviews
*   Batch API calls where possible

## Output Schema:

{  
"review\_id": "123",  
"aspects": \["battery", "camera"\],  
"aspect\_sentiment": {  
"battery": "negative",  
"camera": "positive"  
},  
"keywords": \["battery drain", "camera quality"\]  
}

## Storage:

*   Collection: ai\_outputs

# 📊 4. Insights Stage (Aggregation Layer)

## Objective:

Convert individual outputs → system-level insights

## Key Operations:

### 1\. Aggregation

*   Count sentiments per feature

battery → 70% negative  
camera → 80% positive

### 2\. Trend Analysis

*   Group by time window:
    *   hourly / daily

battery complaints:  
Day 1 → 10  
Day 2 → 45 🚨 spike

### 3\. Spike Detection Logic

*   Simple version:

if today\_count > (avg\_last\_3\_days \* threshold):  
trigger\_alert()

### 4\. Root Cause Linking

*   Match keywords with:
    *   version numbers
    *   events (update, release)

## Output Schema:

{  
"feature\_sentiment\_summary": {...},  
"trends": {...},  
"alerts": \[...\]  
}

## Storage:

*   Collection: insights

# 🎯 5. Action Stage (Decision Engine)

## Objective:

Convert insights → actionable outputs

## Approach:

Use **rule-based system (hackathon-friendly)**

## Rule Examples:

### Rule 1: High Negative Sentiment

if feature\_negative > 60%:  
action = "High Priority Fix Required"

### Rule 2: Sudden Spike

if spike\_detected:  
action = "Investigate recent update"

### Rule 3: Prediction (basic)

*   Linear extrapolation:

future\_rating = current - trend\_slope

## Output:

{  
"actions": \[  
"Fix battery issue urgently",  
"Notify users about fix"  
\]  
}

## Storage:

*   Collection: actions

# 🔄 Data Movement (VERY IMPORTANT)

## Flow Type:

*   **Sequential pipeline (synchronous for hackathon)**

## Execution Flow:

1\. User uploads reviews / system loads dataset  
2\. → ingest\_reviews()  
3\. → preprocess()  
4\. → ai\_analyze()  
5\. → generate\_insights()  
6\. → generate\_actions()  
7\. → return response / store results

## API Flow Example:

POST /analyze  
→ triggers full pipeline  
→ returns:  
insights + actions

## Optional Optimization:

*   Use async queues (only if time permits)
    *   Celery / Kafka

# 🧠 Engineering Decisions (Critical)

### 1\. Batch vs Real-Time

*   Use **batch processing**
*   Simulate real-time via UI refresh

### 2\. Modularity

*   Each stage = separate function/module
*   Makes debugging easy

### 3\. Logging

*   Log each stage:
    *   input
    *   output
    *   errors

### 4\. Error Handling

*   If AI fails:
    *   fallback to basic sentiment
*   If translation fails:
    *   process as-is

### 5\. Performance

*   Avoid calling LLM per review individually
*   Batch where possible

# ⚠️ Common Mistakes to Avoid

*   ❌ Skipping preprocessing → bad AI results
*   ❌ Overengineering microservices
*   ❌ Not storing intermediate outputs
*   ❌ Making pipeline tightly coupled

# ✅ Final Dev Summary

*   Build a **linear, modular pipeline**
*   Store output at every stage
*   Use **LLM for intelligence, rules for decisions**
*   Focus on **correct flow > complex models**

# 🗄️ 3. Developer Notes — Data Handling

# 🧩 1. Data Sources

## Objective:

Define **where data comes from** and ensure it is **consistent, scalable, and usable**

## Supported Source Types:

### 1\. Static Dataset (Recommended for Hackathon ✅)

*   Pre-downloaded review datasets
*   Formats:
    *   .csv
    *   .json

#### Example Columns:

review\_id, review\_text, rating, timestamp, product\_id

👉 Use this for:

*   Fast development
*   No dependency on external APIs

### 2\. Web Scraping (Optional ⚠️)

*   Platforms:
    *   Amazon
    *   Play Store
*   Tools:
    *   BeautifulSoup
    *   Selenium

#### Notes:

*   Use only if time permits
*   Beware of:
    *   Rate limiting
    *   HTML structure changes

### 3\. API-based Input (Optional)

*   Accept reviews from frontend/user

{  
"text": "App crashes frequently",  
"rating": 2  
}

## Standardization Layer (VERY IMPORTANT)

Regardless of source, convert data into **one unified schema**:

{  
"review\_id": "string",  
"text": "string",  
"rating": 1-5,  
"timestamp": "ISO 8601",  
"product\_id": "string",  
"source": "string"  
}

👉 **Rule:**  
All downstream modules must ONLY use this format.

## Developer Decisions:

*   Prefer **dataset + optional API input**
*   Avoid live scraping during demo (unreliable)

# 🧹 2. Preprocessing Pipeline

## Objective:

Transform raw text → clean, structured, AI-ready input

## Pipeline Design:

Each step should be a **separate function**

def preprocess\_pipeline(review):  
review = clean\_text(review)  
review = normalize(review)  
review = deduplicate(review)  
review = detect\_language(review)  
review = translate\_if\_needed(review)  
return review

## Step-by-Step Processing

### 🔹 2.1 Text Cleaning

## Tasks:

*   Convert to lowercase
*   Remove:
    *   URLs
    *   HTML tags
    *   special characters
    *   extra whitespace

import re  
  
def clean\_text(text):  
text = text.lower()  
text = re.sub(r"http\\S+", "", text)  
text = re.sub(r"\[^a-zA-Z0-9\\s\]", "", text)  
text = re.sub(r"\\s+", " ", text).strip()  
return text

### 🔹 2.2 Normalization

## Tasks:

*   Expand contractions:
    *   “can’t” → “cannot”
*   Basic slang mapping (optional)

slang\_map = {  
"btw": "by the way",  
"lol": "laughing"  
}

### 🔹 2.3 Deduplication

## Why:

Duplicate reviews distort trends

## Method:

*   Hash cleaned text

import hashlib  
  
def get\_hash(text):  
return hashlib.md5(text.encode()).hexdigest()

*   Store hashes in DB
*   Skip if already exists

### 🔹 2.4 Language Detection

## Tools:

*   langdetect
*   fastText (better)

from langdetect import detect  
  
lang = detect(text)

### 🔹 2.5 Translation (if non-English)

## Approach:

*   Use API:
    *   OpenAI / Google Translate

if lang != "en":  
text = translate(text)

## Output Schema (Processed Data):

{  
"review\_id": "123",  
"clean\_text": "battery drains fast after update",  
"language": "en",  
"timestamp": "...",  
"product\_id": "xyz"  
}

## Key Rules:

*   Processing must be **deterministic**
*   Avoid modifying meaning of text
*   Keep original text stored separately

# 🗃️ 3. Storage Design

## Objective:

Store data in structured layers for:

*   Debugging
*   Scalability
*   Reusability

## Recommended Approach: **Multi-Collection Design**

## Option 1: MongoDB (Recommended ✅)

### Why:

*   Flexible schema (great for NLP outputs)
*   Fast iteration
*   JSON-friendly

### Collections:

#### 1\. raw\_reviews

{  
"review\_id": "...",  
"text": "...",  
"rating": 4,  
"timestamp": "...",  
"source": "amazon"  
}

#### 2\. processed\_reviews

{  
"review\_id": "...",  
"clean\_text": "...",  
"language": "en"  
}

#### 3\. ai\_outputs

{  
"review\_id": "...",  
"aspects": \[...\],  
"sentiment": {...}  
}

#### 4\. insights

{  
"feature\_summary": {...},  
"trends": {...}  
}

## Option 2: PostgreSQL (Alternative)

### Use if:

*   You want structured queries

### Tables:

*   raw\_reviews
*   processed\_reviews
*   ai\_outputs

## Indexing (IMPORTANT)

For performance:

### MongoDB:

db.raw\_reviews.createIndex({ review\_id: 1 })  
db.processed\_reviews.createIndex({ review\_id: 1 })

## Developer Rule:

👉 Never overwrite data  
👉 Always create new layer outputs

# ⚙️ 4. Processing Type — Batch System

## Recommended: **Batch Processing ✅**

## Why Batch:

*   Simpler to implement
*   Easier debugging
*   No infra overhead

## Execution Flow:

Load Dataset → Process All Reviews → Store → Run AI → Generate Insights

## Implementation:

### Option 1: Single Script

def run\_pipeline():  
data = load\_data()  
for review in data:  
processed = preprocess(review)  
ai\_output = analyze(processed)  
store(ai\_output)

### Option 2: API Trigger

POST /process-batch

## Batch Size Optimization:

*   Process in chunks:

batch\_size = 50

## Optional: Parallel Processing

from multiprocessing import Pool

## Real-Time Simulation (for demo)

*   Re-run pipeline every few seconds
*   Or simulate streaming

# 🔄 Data Flow Summary

Raw Data  
↓  
Preprocessing  
↓  
Processed Data Stored  
↓  
AI Processing  
↓  
Insights Generated

# 🧠 Engineering Decisions (Critical)

### 1\. Separate Raw vs Processed Data

*   Helps debugging
*   Allows reprocessing

### 2\. Idempotency

*   Running pipeline multiple times should not duplicate data

### 3\. Logging

Log at each step:

print("Processing review:", review\_id)

### 4\. Failure Handling

*   If preprocessing fails:
    *   skip review
*   If translation fails:
    *   continue with original text

### 5\. Data Quality Checks

*   Remove empty reviews
*   Remove extremely short text (< 3 words)

# ⚠️ Common Mistakes to Avoid

*   ❌ Mixing raw and processed data
*   ❌ Skipping deduplication
*   ❌ Not standardizing schema
*   ❌ Trying real-time streaming too early
*   ❌ Not indexing DB

# ✅ Final Developer Summary

*   Use **static dataset + unified schema**
*   Build a **modular preprocessing pipeline**
*   Store data in **layered collections**
*   Use **batch processing for simplicity**
*   Ensure **clean, consistent, AI-ready input**

# 🧠 4. Developer Notes — NLP & Intelligence Layer

# 🎯 Objective

Convert **unstructured review text → structured intelligence**

Input: "battery sucks but camera is amazing"  
Output: {  
aspects: \["battery", "camera"\],  
sentiment: {  
"battery": "negative",  
"camera": "positive"  
}  
}

# 🧩 1. Core Tasks Breakdown

## 🔹 1.1 Aspect (Feature) Extraction

### Goal:

Identify **product components** mentioned in the review.

## Approaches:

### ✅ Option A: LLM-Based (Recommended)

Use prompt-based extraction.

#### Prompt Template:

Extract product features mentioned in the review.  
  
Rules:  
\- Return only features (1–3 words)  
\- Avoid duplicates  
\- Ignore general words like "product", "app"  
  
Review:  
"{review}"  
  
Output (JSON):  
{  
"aspects": \[\]  
}

### Example:

Input:  
"Battery drains fast but camera quality is great"  
  
Output:  
\["battery", "camera"\]

### ⚙️ Implementation:

def extract\_aspects(text):  
response = llm(prompt.format(review=text))  
return response\["aspects"\]

### ⚠️ Constraints:

*   Limit to **max 5 aspects per review**
*   Normalize output:
    *   lowercase
    *   singular form

### 🔁 Optional Optimization:

*   Maintain **predefined aspect list**:

KNOWN\_ASPECTS = \["battery", "camera", "performance", "ui", "price"\]

*   Match LLM output to closest known aspect

## 🔹 1.2 Aspect-Based Sentiment Analysis

### Goal:

Assign sentiment **per extracted aspect**

### Approach: LLM Structured Output

#### Prompt:

For each feature, classify sentiment as:  
positive / negative / neutral  
  
Review:  
"{review}"  
  
Features:  
{aspects}  
  
Output (JSON):  
{  
"sentiment": {  
"feature": "label"  
}  
}

### Example:

{  
"battery": "negative",  
"camera": "positive"  
}

### ⚙️ Implementation:

def get\_aspect\_sentiment(text, aspects):  
response = llm(prompt)  
return response\["sentiment"\]

### 💡 Important:

*   Always **pass extracted aspects explicitly**
*   Prevents hallucination

## 🔹 1.3 Emotion Detection (Optional but High Impact)

### Goal:

Capture **user intent intensity**

### Labels:

*   anger
*   frustration
*   satisfaction
*   neutral

### Prompt:

Classify emotion of the review:  
Choose one: anger, frustration, satisfaction, neutral  
  
Review:  
"{review}"  
  
Output:  
{  
"emotion": ""  
}

### Use Case:

*   Prioritize urgent issues (anger > neutral)

# 🧠 2. NLP Pipeline Design

## Full Flow:

Clean Text  
↓  
Aspect Extraction  
↓  
Aspect Sentiment  
↓  
Emotion Detection (optional)  
↓  
Keyword Extraction

## Combined Output Schema:

{  
"review\_id": "123",  
"aspects": \["battery", "camera"\],  
"aspect\_sentiment": {  
"battery": "negative",  
"camera": "positive"  
},  
"emotion": "frustration",  
"keywords": \["battery drain", "camera quality"\]  
}

# ⚙️ 3. Implementation Strategy

## ✅ Option A: API-Based (Recommended)

### Why:

*   Fast
*   No training required
*   High accuracy

## Tools:

*   OpenAI API (primary)
*   Claude (alternative)

## API Call Structure:

response = client.chat.completions.create(  
model="gpt-4o-mini",  
messages=\[...\],  
temperature=0  
)

## Key Settings:

*   temperature = 0 → deterministic output
*   Use **JSON mode** if available

## ⚡ Optimization: Single Call vs Multi Call

### ❌ Bad:

*   Separate calls for:
    *   aspects
    *   sentiment
    *   emotion

### ✅ Good:

*   Combine into **ONE prompt**

### Combined Prompt:

Analyze the review and return:  
  
1\. Aspects  
2\. Sentiment per aspect  
3\. Emotion  
  
Review:  
"{review}"  
  
Output JSON:  
{  
"aspects": \[\],  
"aspect\_sentiment": {},  
"emotion": ""  
}

👉 Reduces:

*   latency
*   cost
*   API calls

## 🔁 Option B: Pretrained Models (Fallback)

## Use When:

*   API unavailable
*   Offline mode needed

## Tools:

*   HuggingFace
    *   bert-base-uncased
    *   nlptown/bert-base-multilingual

## Tasks Mapping:

| Task | Model |
| --- | --- |
| Sentiment | BERT classifier |
| Aspect extraction | NER / keyword extraction |
| Emotion | emotion classifier |

## Limitation:

*   Less accurate than LLM
*   Needs more glue logic

# 🧠 4. Prompt Engineering (CRITICAL)

## Rules:

*   Always ask for **JSON output**
*   Be explicit about format
*   Avoid open-ended responses

## Strict Prompt Pattern:

Return ONLY valid JSON.  
Do not include explanation.

## Validation Step:

import json  
  
def safe\_parse(response):  
try:  
return json.loads(response)  
except:  
return fallback()

# 📦 5. Post-Processing Layer

## Normalize Output:

### Lowercase everything:

aspect = aspect.lower()

### Remove duplicates:

aspects = list(set(aspects))

### Validate sentiment labels:

VALID = \["positive", "negative", "neutral"\]

## Map Similar Terms:

mapping = {  
"battery life": "battery",  
"cam": "camera"  
}

# ⚡ 6. Performance Optimization

## 1\. Caching

cache\[text\] = result

Avoid reprocessing same review

## 2\. Batch Processing

Send multiple reviews:

reviews = \[r1, r2, r3\]

## 3\. Rate Limiting

*   Add delay if API limit hit

# ⚠️ 7. Failure Handling

## Case 1: LLM fails

*   Retry once
*   Then fallback:

return {  
"aspects": \[\],  
"aspect\_sentiment": {},  
"emotion": "neutral"  
}

## Case 2: Invalid JSON

*   Use regex extraction
*   Or discard review

## Case 3: No aspects found

*   Assign:

aspects = \["general"\]

# 🧪 8. Testing Strategy

## Test Cases:

### 1\. Simple

*   "Battery is bad"  
    → battery: negative

### 2\. Mixed

*   "Battery bad but camera good"

### 3\. Sarcasm

*   "Great, phone died again"

### 4\. Multilingual

*   "Battery bahut kharab hai"

# ⚠️ Common Mistakes

*   ❌ Not constraining LLM output
*   ❌ Multiple API calls per review
*   ❌ No validation layer
*   ❌ Ignoring normalization
*   ❌ Not handling empty outputs

# ✅ Final Developer Summary

*   Use **LLM-based unified analysis (single call)**
*   Extract:
    *   aspects
    *   sentiment
    *   emotion
*   Enforce **strict JSON outputs**
*   Add **post-processing + validation**

**⚙️ 5. Developer Notes — Feature Logic**

**🧩 1. Feature List (System Capabilities)**

**Implemented Features (List Only)**

Keep this section concise in docs/UI, but internally support:

1.  Feature-Level Sentiment Analysis
2.  Trend Spike Detection
3.  Action Recommendation Engine
4.  Root Cause Detection (lightweight)
5.  Basic Forecasting (optional/simple)

👉 **Dev Rule:**  
Only **fully implement top 3**. Others can be lightweight or simulated.

**🧠 2. Feature 1: Feature-Level Sentiment Analysis (CORE)**

**🎯 Objective**

Convert raw review text into:

{  
"feature": "sentiment"  
}

**🔁 Pipeline Dependency**

Uses output from:

*   NLP Layer:
    *   aspects
    *   aspect\_sentiment

**⚙️ Implementation Steps**

**Step 1: Extract Aspects**

Already handled in NLP layer:

{  
"aspects": \["battery", "camera"\]  
}

**Step 2: Map Sentiment to Aspects**

{  
"battery": "negative",  
"camera": "positive"  
}

**Step 3: Aggregate Across Reviews**

**Data Structure:**

feature\_stats = {  
"battery": {"positive": 0, "negative": 0, "neutral": 0},  
"camera": {"positive": 0, "negative": 0, "neutral": 0}  
}

**Step 4: Update Counts**

for review in ai\_outputs:  
for aspect, sentiment in review\["aspect\_sentiment"\].items():  
feature\_stats\[aspect\]\[sentiment\] += 1

**Step 5: Compute Percentages**

def compute\_ratio(stats):  
total = sum(stats.values())  
return {  
k: round(v / total, 2) for k, v in stats.items()  
}

**Final Output:**

{  
"battery": {  
"positive": 0.2,  
"negative": 0.7,  
"neutral": 0.1  
}  
}

**📌 Storage:**

*   Collection: feature\_summary

**⚠️ Edge Cases:**

*   No aspects → assign "general"
*   Conflicting sentiments → count both

**🧠 Dev Insight:**

This feature feeds:

*   Trend Detection
*   Action Engine

👉 Treat this as **source of truth**

**📈 3. Feature 2: Trend Spike Detection**

**🎯 Objective**

Detect **sudden increase in complaints** for a feature

**📊 Required Data:**

*   timestamp
*   aspect\_sentiment

**🧱 Data Preparation**

Group data by:

*   feature
*   time window (day/hour)

**Data Structure:**

trend\_data = {  
"battery": {  
"2026-04-01": 12,  
"2026-04-02": 18,  
"2026-04-03": 45  
}  
}

(Count only **negative sentiment** for spikes)

**⚙️ Spike Detection Logic**

**Step 1: Moving Average**

def moving\_avg(values):  
return sum(values) / len(values)

**Step 2: Spike Rule**

THRESHOLD = 2.0 # configurable  
  
if today\_count > avg\_last\_3\_days \* THRESHOLD:  
spike = True

**Step 3: Output**

{  
"feature": "battery",  
"spike": true,  
"increase": "150%"  
}

**📌 Storage:**

*   Collection: trend\_alerts

**⚠️ Edge Cases:**

*   Less than 3 days data → skip spike detection
*   Sudden drop → ignore (focus on negative spikes)

**⚡ Optimization:**

*   Pre-aggregate daily counts
*   Avoid recalculating entire dataset

**🧠 Dev Insight:**

*   Keep logic **simple but explainable**
*   Judges prefer clarity > complex ML

**🎯 4. Feature 3: Action Recommendation Engine (MOST IMPORTANT)**

**🎯 Objective**

Convert insights → **clear business actions**

**🔁 Input:**

*   Feature sentiment summary
*   Trend alerts

**⚙️ Implementation Type:**

👉 **Rule-Based System (Recommended)**

**🧱 Rule Engine Structure**

def generate\_actions(feature\_stats, trends):  
actions = \[\]  
\# rules applied here  
return actions

**🧠 Core Rules**

**Rule 1: High Negative Sentiment**

if feature\_stats\["battery"\]\["negative"\] > 0.6:  
actions.append("High priority: Fix battery issue")

**Rule 2: Spike Detected**

if trend\["battery"\]\["spike"\]:  
actions.append("Urgent: Investigate recent changes affecting battery")

**Rule 3: Combined Rule (STRONG)**

if negative > 0.6 and spike:  
actions.append("CRITICAL: Release hotfix within 48 hours")

**Rule 4: Positive Signal**

if feature\_stats\["camera"\]\["positive"\] > 0.8:  
actions.append("Promote camera feature in marketing")

**🧾 Output Format:**

{  
"priority\_actions": \[  
{  
"feature": "battery",  
"priority": "critical",  
"action": "Release hotfix within 48 hours"  
}  
\]  
}

**📌 Storage:**

*   Collection: actions

**🧠 Explainability (VERY IMPORTANT)**

Each action must include:

{  
"reason": "Negative sentiment increased by 40% in last 2 days"  
}

**⚠️ Edge Cases:**

*   No strong signals → return empty list
*   Multiple features → prioritize top 3

**🧠 Dev Insight:**

👉 This is your **“judge-winning feature”**

**🧪 5. (Optional) Root Cause Detection (Lightweight)**

**Goal:**

Link issues → possible cause

**Method:**

*   Keyword matching

if "update" in keywords:  
cause = "Recent update"

**Output:**

{  
"battery": "Issue likely caused by recent update"  
}

**🔮 6. (Optional) Basic Forecasting**

**Simple Approach:**

Linear trend

trend = (today - previous\_day)  
future = current - trend \* days

**Output:**

{  
"predicted\_rating": 3.6  
}

**🔄 Feature Interaction Flow**

NLP Output  
↓  
Feature Sentiment Aggregation  
↓  
Trend Detection  
↓  
Action Engine

**⚠️ Common Mistakes**

*   ❌ Overbuilding all 10 features
*   ❌ Using ML where rules are enough
*   ❌ Not aggregating properly
*   ❌ Ignoring timestamps
*   ❌ No explainability in actions

**🧠 Engineering Decisions**

**1\. Keep Features Decoupled**

*   Each feature = independent module

**2\. Use Simple Math Over ML**

*   Faster
*   Easier to debug
*   Easier to explain

**3\. Prioritize Interpretability**

*   Every output must be explainable

**✅ Final Developer Summary**

*   Implement **3 core features deeply**:
    1.  Feature Sentiment
    2.  Trend Detection
    3.  Action Engine
*   Use:
    1.  Aggregation for sentiment
    2.  Moving averages for trends
    3.  Rule-based logic for actions
*   Ensure:
    1.  Clean data flow
    2.  Explainable outputs
    3.  Modular implementation

**🎯 6. Developer Notes — Decision Engine (Core Differentiator)**

**🧠 Objective**

Convert structured insights into:

Insights → Decisions → Business Actions

👉 This module is responsible for:

*   Prioritization
*   Alert generation
*   Recommendation generation
*   Explainability

**🧩 1. Input to Decision Engine**

**Source:**

Outputs from previous layers:

**Required Inputs:**

**1\. Feature Sentiment Summary**

{  
"battery": {  
"positive": 0.2,  
"negative": 0.7,  
"neutral": 0.1  
},  
"camera": {  
"positive": 0.8,  
"negative": 0.1,  
"neutral": 0.1  
}  
}

**2\. Trend Alerts**

{  
"battery": {  
"spike": true,  
"increase\_percent": 150  
}  
}

**3\. (Optional) Root Cause Signals**

{  
"battery": "Recent update v2.1"  
}

**4\. (Optional) Volume Metrics**

{  
"battery": 120,  
"camera": 80  
}

👉 Helps avoid decisions based on low data

**Validation Layer (MANDATORY)**

Before processing:

def validate\_inputs(data):  
assert "feature\_sentiment" in data  
assert isinstance(data\["feature\_sentiment"\], dict)

**⚙️ 2. Decision Engine Architecture**

**Recommended Design:**

👉 Rule-Based Engine (Deterministic + Explainable)

**Structure:**

class DecisionEngine:  
def \_\_init\_\_(self, thresholds):  
self.thresholds = thresholds  
  
def evaluate(self, inputs):  
actions = \[\]  
alerts = \[\]  
  
for feature in inputs\["feature\_sentiment"\]:  
result = self.apply\_rules(feature, inputs)  
actions.extend(result\["actions"\])  
alerts.extend(result\["alerts"\])  
  
return actions, alerts

**Configuration (IMPORTANT)**

Define all thresholds in one place:

THRESHOLDS = {  
"high\_negative": 0.6,  
"medium\_negative": 0.4,  
"spike\_multiplier": 2.0,  
"min\_volume": 10  
}

👉 Makes system tunable without code changes

**🧠 3. Core Decision Logic**

**Rule Evaluation Flow (per feature)**

Check volume → Check sentiment → Check trend → Combine → Generate action

**🔹 Rule 1: High Negative Sentiment**

**Logic:**

if negative\_ratio >= 0.6:

**Output:**

{  
"type": "action",  
"priority": "high",  
"message": "High negative sentiment detected for battery"  
}

**Explanation:**

"reason": "70% of reviews for battery are negative"

**🔹 Rule 2: Moderate Negative Sentiment**

if 0.4 <= negative\_ratio < 0.6:

**Output:**

*   Medium priority monitoring alert

**🔹 Rule 3: Spike Detection (Critical)**

**Logic:**

if trend\["spike"\] == True:

**Output:**

{  
"priority": "high",  
"message": "Sudden spike in battery complaints detected"  
}

**Explanation:**

"reason": "Complaints increased by 150% compared to last 3 days"

**🔹 Rule 4: Combined Critical Rule (VERY IMPORTANT)**

**Logic:**

if negative\_ratio >= 0.6 and spike:

**Output:**

{  
"priority": "critical",  
"message": "Critical issue detected in battery. Immediate action required"  
}

**Suggested Action:**

"action": "Release hotfix within 48 hours"

👉 This is your **strongest decision rule**

**🔹 Rule 5: Positive Signal (Business Insight)**

if positive\_ratio >= 0.8:

**Output:**

{  
"type": "recommendation",  
"message": "Promote camera feature in marketing campaigns"  
}

**🔹 Rule 6: Low Volume Filter (IMPORTANT)**

**Logic:**

if volume < THRESHOLDS\["min\_volume"\]:  
skip feature

👉 Prevents false alerts

**🔹 Rule 7: Root Cause Integration**

**Logic:**

if "update" in root\_cause:

**Output:**

{  
"message": "Issue likely caused by recent update"  
}

**🧾 4. Output Structure**

**Final Output Schema:**

{  
"alerts": \[  
{  
"feature": "battery",  
"priority": "critical",  
"message": "Spike detected in complaints",  
"reason": "150% increase in last 2 days"  
}  
\],  
"actions": \[  
{  
"feature": "battery",  
"priority": "high",  
"action": "Release hotfix within 48 hours",  
"reason": "70% negative sentiment + spike"  
}  
\]  
}

**Priority Levels:**

*   low
*   medium
*   high
*   critical

**🔄 5. Execution Flow**

Input Insights  
↓  
Validate Data  
↓  
Loop per Feature  
↓  
Apply Rules  
↓  
Aggregate Results  
↓  
Return Alerts + Actions

**⚡ 6. Optimization Strategies**

**1\. Precompute Metrics**

*   Sentiment ratios computed before engine

**2\. Avoid Reprocessing**

*   Cache insights

**3\. Config-Driven Rules**

*   Store thresholds in config file

**⚠️ 7. Failure Handling**

**Case 1: Missing Data**

if feature not in trends:  
assume spike = False

**Case 2: Invalid Ratios**

*   Normalize or skip

**Case 3: No Actions Generated**

{  
"message": "No significant issues detected"  
}

**🧪 8. Testing Strategy**

**Test Cases:**

**1\. High Negative Only**

*   Expect: High priority action

**2\. Spike Only**

*   Expect: Alert

**3\. Combined**

*   Expect: Critical action

**4\. Low Volume**

*   Expect: No action

**⚠️ Common Mistakes**

*   ❌ Hardcoding logic everywhere
*   ❌ No explainability
*   ❌ Ignoring volume
*   ❌ Overcomplicating with ML
*   ❌ No priority levels

**🧠 Engineering Principles**

**1\. Deterministic > Probabilistic**

*   Decisions must be predictable

**2\. Explainability is Mandatory**

*   Every output must include a reason

**3\. Configurable System**

*   Thresholds should be adjustable

**4\. Modular Rule Design**

*   Each rule = separate function

**✅ Final Developer Summary**

*   Build a **rule-based decision engine**
*   Inputs:
    *   sentiment
    *   trends
    *   volume
*   Apply:
    *   threshold-based rules
*   Output:
    *   alerts
    *   actions
    *   reasons

**🎯 7. Developer Notes — Decision Engine (Core Differentiator)**

**🧠 Objective**

Convert structured insights into:

Insights → Decisions → Business Actions

👉 This module is responsible for:

*   Prioritization
*   Alert generation
*   Recommendation generation
*   Explainability

**🧩 1. Input to Decision Engine**

**Source:**

Outputs from previous layers:

**Required Inputs:**

**1\. Feature Sentiment Summary**

{  
"battery": {  
"positive": 0.2,  
"negative": 0.7,  
"neutral": 0.1  
},  
"camera": {  
"positive": 0.8,  
"negative": 0.1,  
"neutral": 0.1  
}  
}

**2\. Trend Alerts**

{  
"battery": {  
"spike": true,  
"increase\_percent": 150  
}  
}

**3\. (Optional) Root Cause Signals**

{  
"battery": "Recent update v2.1"  
}

**4\. (Optional) Volume Metrics**

{  
"battery": 120,  
"camera": 80  
}

👉 Helps avoid decisions based on low data

**Validation Layer (MANDATORY)**

Before processing:

def validate\_inputs(data):  
assert "feature\_sentiment" in data  
assert isinstance(data\["feature\_sentiment"\], dict)

**⚙️ 2. Decision Engine Architecture**

**Recommended Design:**

👉 Rule-Based Engine (Deterministic + Explainable)

**Structure:**

class DecisionEngine:  
def \_\_init\_\_(self, thresholds):  
self.thresholds = thresholds  
  
def evaluate(self, inputs):  
actions = \[\]  
alerts = \[\]  
  
for feature in inputs\["feature\_sentiment"\]:  
result = self.apply\_rules(feature, inputs)  
actions.extend(result\["actions"\])  
alerts.extend(result\["alerts"\])  
  
return actions, alerts

**Configuration (IMPORTANT)**

Define all thresholds in one place:

THRESHOLDS = {  
"high\_negative": 0.6,  
"medium\_negative": 0.4,  
"spike\_multiplier": 2.0,  
"min\_volume": 10  
}

👉 Makes system tunable without code changes

**🧠 3. Core Decision Logic**

**Rule Evaluation Flow (per feature)**

Check volume → Check sentiment → Check trend → Combine → Generate action

**🔹 Rule 1: High Negative Sentiment**

**Logic:**

if negative\_ratio >= 0.6:

**Output:**

{  
"type": "action",  
"priority": "high",  
"message": "High negative sentiment detected for battery"  
}

**Explanation:**

"reason": "70% of reviews for battery are negative"

**🔹 Rule 2: Moderate Negative Sentiment**

if 0.4 <= negative\_ratio < 0.6:

**Output:**

*   Medium priority monitoring alert

**🔹 Rule 3: Spike Detection (Critical)**

**Logic:**

if trend\["spike"\] == True:

**Output:**

{  
"priority": "high",  
"message": "Sudden spike in battery complaints detected"  
}

**Explanation:**

"reason": "Complaints increased by 150% compared to last 3 days"

**🔹 Rule 4: Combined Critical Rule (VERY IMPORTANT)**

**Logic:**

if negative\_ratio >= 0.6 and spike:

**Output:**

{  
"priority": "critical",  
"message": "Critical issue detected in battery. Immediate action required"  
}

**Suggested Action:**

"action": "Release hotfix within 48 hours"

👉 This is your **strongest decision rule**

**🔹 Rule 5: Positive Signal (Business Insight)**

if positive\_ratio >= 0.8:

**Output:**

{  
"type": "recommendation",  
"message": "Promote camera feature in marketing campaigns"  
}

**🔹 Rule 6: Low Volume Filter (IMPORTANT)**

**Logic:**

if volume < THRESHOLDS\["min\_volume"\]:  
skip feature

👉 Prevents false alerts

**🔹 Rule 7: Root Cause Integration**

**Logic:**

if "update" in root\_cause:

**Output:**

{  
"message": "Issue likely caused by recent update"  
}

**🧾 4. Output Structure**

**Final Output Schema:**

{  
"alerts": \[  
{  
"feature": "battery",  
"priority": "critical",  
"message": "Spike detected in complaints",  
"reason": "150% increase in last 2 days"  
}  
\],  
"actions": \[  
{  
"feature": "battery",  
"priority": "high",  
"action": "Release hotfix within 48 hours",  
"reason": "70% negative sentiment + spike"  
}  
\]  
}

**Priority Levels:**

*   low
*   medium
*   high
*   critical

**🔄 5. Execution Flow**

Input Insights  
↓  
Validate Data  
↓  
Loop per Feature  
↓  
Apply Rules  
↓  
Aggregate Results  
↓  
Return Alerts + Actions

**⚡ 6. Optimization Strategies**

**1\. Precompute Metrics**

*   Sentiment ratios computed before engine

**2\. Avoid Reprocessing**

*   Cache insights

**3\. Config-Driven Rules**

*   Store thresholds in config file

**⚠️ 7. Failure Handling**

**Case 1: Missing Data**

if feature not in trends:  
assume spike = False

**Case 2: Invalid Ratios**

*   Normalize or skip

**Case 3: No Actions Generated**

{  
"message": "No significant issues detected"  
}

**🧪 8. Testing Strategy**

**Test Cases:**

**1\. High Negative Only**

*   Expect: High priority action

**2\. Spike Only**

*   Expect: Alert

**3\. Combined**

*   Expect: Critical action

**4\. Low Volume**

*   Expect: No action

**⚠️ Common Mistakes**

*   ❌ Hardcoding logic everywhere
*   ❌ No explainability
*   ❌ Ignoring volume
*   ❌ Overcomplicating with ML
*   ❌ No priority levels

**🧠 Engineering Principles**

**1\. Deterministic > Probabilistic**

*   Decisions must be predictable

**2\. Explainability is Mandatory**

*   Every output must include a reason

**3\. Configurable System**

*   Thresholds should be adjustable

**4\. Modular Rule Design**

*   Each rule = separate function

**✅ Final Developer Summary**

*   Build a **rule-based decision engine**
*   Inputs:
    *   sentiment
    *   trends
    *   volume
*   Apply:
    *   threshold-based rules
*   Output:
    *   alerts
    *   actions
    *   reasons

**🚀 8. Developer Notes — Deployment & Execution Plan**

**🎯 Objective**

Make the system:

*   Fully runnable (end-to-end)
*   Accessible via public URL
*   Fast enough for live demo
*   Stable (no crashes during judging)

**🧩 1. System Architecture (Deployment View)**

**Final Deployed Architecture:**

User (Judge)  
↓  
Frontend (Vercel)  
↓  
Backend API (Render)  
↓  
AI Pipeline (inside backend)  
↓  
Database (MongoDB Atlas)

**Components Breakdown:**

| Component | Tech | Hosting |
| --- | --- | --- |
| Frontend | React / Next.js | Vercel |
| Backend | FastAPI | Render |
| Database | MongoDB | MongoDB Atlas |

**🌐 2. Where to Host (Detailed)**

**🔹 Frontend → Vercel**

👉 Use: Vercel

**Why:**

*   Instant deploy from GitHub
*   Free tier is enough
*   Auto HTTPS
*   Fast global CDN

**Deployment Steps:**

npm install -g vercel  
vercel

OR

*   Push to GitHub
*   Connect repo in Vercel dashboard
*   Click **Deploy**

**Important Config:**

NEXT\_PUBLIC\_API\_URL=https://your-backend.onrender.com

**🔹 Backend → Render**

👉 Use: Render

**Why:**

*   Supports FastAPI easily
*   Free tier available
*   Auto deploy from GitHub
*   Simple UI

**Deployment Steps:**

**1\. Create requirements.txt**

fastapi  
uvicorn  
pymongo  
python-dotenv

**2\. Add start command**

uvicorn main:app --host 0.0.0.0 --port 10000

**3\. Render Settings:**

*   Runtime: Python
*   Build Command:

pip install -r requirements.txt

**⚠️ CRITICAL FIX (Render Port Issue):**

import os  
port = int(os.environ.get("PORT", 10000))

**🔹 Database → MongoDB Atlas**

👉 Use: MongoDB Atlas

**Why:**

*   Cloud-hosted
*   Free tier
*   Easy connection string

**Setup:**

1.  Create cluster
2.  Get connection string:

mongodb+srv://username:password@cluster.mongodb.net/db

**Connect in Code:**

from pymongo import MongoClient  
import os  
  
client = MongoClient(os.getenv("MONGO\_URI"))  
db = client\["acvis"\]

**🔄 3. End-to-End Workflow (CRITICAL)**

**Full Execution Flow:**

1\. User uploads reviews (frontend)  
2\. Frontend calls POST /analyze  
3\. Backend:  
→ preprocess  
→ NLP  
→ feature extraction  
→ decision engine  
4\. Store results in DB  
5\. Return response  
6\. Frontend displays insights + actions

**Simplified UX Flow:**

Upload → Process → Show Results

**Frontend API Call Example:**

const res = await fetch("/analyze", {  
method: "POST",  
headers: { "Content-Type": "application/json" },  
body: JSON.stringify({ reviews })  
});

**⚙️ 4. Execution Strategy (IMPORTANT)**

**DO NOT:**

*   Build everything at once
*   Overcomplicate deployment

**DO THIS IN ORDER:**

**✅ Step 1: Backend FIRST**

*   Run FastAPI locally

uvicorn main:app --reload

*   Test /analyze in Postman

👉 If this fails → STOP everything

**✅ Step 2: Deploy Backend**

*   Push to GitHub
*   Deploy on Render
*   Test live endpoint:

https://your-app.onrender.com/analyze

**✅ Step 3: Connect Frontend**

*   Replace API URL
*   Test integration

**✅ Step 4: Add AI Pipeline**

*   Plug NLP + decision engine
*   Keep fallback if AI fails

**✅ Step 5: Final Polish**

*   UI improvements
*   Add loading spinner
*   Improve response formatting

**🧪 5. Testing Strategy (MANDATORY)**

**Test Cases:**

**1\. Empty Input**

{ "reviews": \[\] }

Expect:

*   Proper error

**2\. Normal Input**

{ "reviews": \[{"text": "Battery bad"}\] }

Expect:

*   Insights + actions

**3\. Large Input**

*   50 reviews

Expect:

*   No crash

**Load Test (Optional):**

ab -n 50 -c 5 https://api/analyze

**⚡ 6. Performance Optimization (Hackathon-Level)**

**1\. Limit Input Size**

if len(reviews) > 50:  
raise Exception("Too many reviews")

**2\. Timeout Protection**

import asyncio  
  
await asyncio.wait\_for(run\_pipeline(), timeout=10)

**3\. Preload Models**

*   Load AI models at startup
*   Avoid loading per request

**4\. Use Async Everywhere**

**🔐 7. Environment Variables**

**Store securely:**

MONGO\_URI=xxxx  
OPENAI\_API\_KEY=xxxx

**Load in code:**

from dotenv import load\_dotenv  
load\_dotenv()

**🚨 8. Failure Handling (DEMO SAFETY)**

**Worst Case Scenario Plan:**

**If AI fails:**

Return:

{  
"message": "Basic analysis completed",  
"fallback": true  
}

**If DB fails:**

*   Skip storage
*   Return result directly

**If Backend slow:**

*   Show loading UI
*   Add timeout fallback

**⏱️ 9. Timeline (STRICT EXECUTION PLAN)**

**🟢 Day 1 — Backend + Deployment**

*   Build FastAPI
*   Create /analyze
*   Deploy on Render
*   Test live API

**🟡 Day 2 — AI + Features**

*   NLP integration
*   Feature extraction
*   Decision engine
*   Store in DB

**🔵 Day 3 — Polish + Demo**

*   UI improvements
*   Add charts (optional)
*   Fix bugs
*   Practice demo

**🎤 10. Demo Strategy (IMPORTANT)**

**Demo Flow:**

1\. Open frontend  
2\. Upload sample reviews  
3\. Click Analyze  
4\. Show:  
→ insights  
→ alerts  
→ actions  
5\. Highlight "real-time decision engine"

**Backup Plan:**

*   Keep sample JSON ready
*   Keep screenshots ready

**⚠️ Common Deployment Mistakes**

*   ❌ Backend not deployed before frontend
*   ❌ Hardcoded localhost URLs
*   ❌ Missing environment variables
*   ❌ Large model loading per request
*   ❌ No error handling

**🧠 Engineering Principles**

**1\. Reliability > Complexity**

👉 Simple system that works > advanced system that crashes

**2\. Fast Feedback Loop**

👉 Deploy early, fix fast

**3\. Demo-Oriented Design**

👉 Optimize for presentation, not perfection

**✅ Final Developer Summary**

*   Host:
    *   Frontend → Vercel
    *   Backend → Render
    *   DB → MongoDB Atlas
*   Flow:

Upload → Process → Show Results

*   Timeline:
    *   Day 1 → Backend + Deploy
    *   Day 2 → AI + Logic
    *   Day 3 → Polish