# ACVIS (Automated Customer Voice & Insight System)
**Comprehensive Project Documentation**

---

## 1. Project Overview
ACVIS is an end-to-end, AI-powered web platform designed to automatically analyze large volumes of e-commerce customer reviews. It transforms raw, unstructured feedback into actionable, structured data, enabling product managers and businesses to make data-driven decisions instantly.

By leveraging advanced Natural Language Processing (NLP) and Large Language Models (LLMs), ACVIS categorizes reviews, detects nuanced sentiments across multiple product features (aspect-based sentiment analysis), extracts critical insights, and automatically generates strategic recommendations (Actions) to improve product quality.

---

## 2. Technical Stack
The application is built on a modern, decoupled architecture:

### Frontend (User Interface)
*   **React 18**: Core UI library.
*   **Vite**: Lightning-fast build tool and development server.
*   **Tailwind CSS**: Utility-first CSS framework for a responsive, premium "Amazon-style" aesthetic.
*   **Recharts**: For dynamic data visualization (donut charts, trend lines, bar graphs).
*   **Lucide React**: For scalable, clean SVG icons.

### Backend (API & Processing)
*   **FastAPI**: High-performance Python web framework for handling API routes and asynchronous requests.
*   **Pydantic**: For robust data validation and schema definition.
*   **Uvicorn**: Lightning-fast ASGI server.

### AI & NLP Pipeline
*   **Groq API**: Utilizes the cutting-edge **Llama-3.3-70b-versatile** model for incredibly fast, highly accurate NLP inference, transforming raw text into structured JSON.
*   **Sentence-Transformers (HuggingFace)**: Uses `all-MiniLM-L6-v2` to generate vector embeddings for semantic similarity and normalization.
*   **Scikit-Learn**: Employs cosine similarity for mapping arbitrary LLM outputs to a standardized ontology (canonical aspects).

### Database
*   **MongoDB Atlas**: Cloud-hosted NoSQL database used to store processed reviews, aggregated insights, action items, and caching layers efficiently.
*   **PyMongo**: Python driver for seamless MongoDB integration.

### Deployment
*   **Vercel**: Hosts the React frontend.
*   **Render**: Hosts the FastAPI backend and AI Python pipeline.

---

## 3. Methodology & Architecture

The core of ACVIS is a highly optimized, 6-stage NLP pipeline that processes reviews synchronously through FastAPI. 

### Stage 1: Ingestion
*   Raw reviews (either via direct user input on the dashboard or bulk uploaded) are received by the `/api/analyze` endpoint.
*   Data is standardized into a consistent dictionary format, ensuring fields like `review_id`, `text`, `rating`, and `timestamp` exist.

### Stage 2: Preprocessing
*   Input text is cleaned and normalized. Whitespace is stripped, and empty strings are dropped.
*   *(Performance Note: Native LLM translation capabilities are utilized, allowing 0ms preprocessing time compared to traditional scraping translators).*

### Stage 3: NLP Inference (Llama 3.3 via Groq)
*   Reviews are batched (up to 10 at a time) to maximize throughput and minimize API calls.
*   The system constructs a strict, highly-engineered **System Prompt** instructing the Llama-3.3 model to act as an expert e-commerce data analyst.
*   **Output generation**: The LLM outputs strict JSON objects extracting:
    *   `aspects`: Which parts of the product are mentioned (e.g., "battery", "delivery").
    *   `aspect_sentiment`: Sentiment mapping for each aspect (Positive, Negative, Neutral).
    *   `emotion`: The overarching emotion of the customer (e.g., "Frustrated", "Delighted").
    *   `keywords`: Key terminology.
*   **Resiliency**: If the primary API key exhausts its Token-Per-Day (TPD) rate limit (`429 Error`), the pipeline automatically hot-swaps to a secondary fallback API key (`GROQ_FALLBACK_API_KEY`) ensuring zero downtime.

### Stage 4: Normalization (Semantic Search)
*   LLMs often return varying terminology for the same concept (e.g., "battery life", "battery drain", "power").
*   ACVIS uses a pre-trained **Sentence Transformer (`all-MiniLM-L6-v2`)** to convert the LLM-generated aspects into 384-dimensional vector embeddings.
*   Using **Cosine Similarity**, the pipeline maps these arbitrary aspects to a strict list of 11 canonical aspects (e.g., `battery`, `camera`, `performance`, `ui`, `customer_support`). 

### Stage 5: Aggregation & Insights
*   Normalized data is aggregated mathematically. The system calculates:
    *   Total positive/negative/neutral reviews per canonical aspect.
    *   Average ratings per aspect.
    *   Trend metrics to observe aspect perception over time.
*   This forms the "Insights" database collection, which powers the frontend charts.

### Stage 6: Action Generation
*   Once insights are aggregated, the system identifies the most critical failing aspects (e.g., high negative sentiment in "battery").
*   It generates **Strategic Action Items** (e.g., "Investigate UI freezing issues on the home screen") and assigns them an impact level (High, Medium, Low).
*   Actions are stored and served to the "Actions" tab on the frontend.

---

## 4. Platform Features & Working Prototype

### Landing Page & Authentication
*   **Landing Page**: A premium, Amazon-style dark-mode interface that introduces the tool's value proposition.
*   **Auth Flow**: Secure JWT-based registration and login system. Routes are protected, ensuring only authenticated managers can view insights.

### Main Dashboard
*   **Top Metric Cards**: Displays real-time statistics (Total Reviews, Average Sentiment Score, Critical Alerts).
*   **Interactive Charts**:
    *   *Donut Chart*: Visual breakdown of overall sentiment (Positive vs Negative).
    *   *Bar Chart*: Aspect-based sentiment analysis, showing exactly which features users love and hate.
*   **Review Submission Input**: A text area allowing users to simulate live incoming data by pasting raw Amazon reviews. Submitting triggers the full 6-stage NLP pipeline in real-time, instantly updating the charts.

### Insights & Trends
*   **Insights Tab**: Deep-dive metrics detailing the exact volume of positive/negative tags mapped to canonical aspects.
*   **Trends Tab**: A chronological line graph tracking sentiment volatility over time, helping managers correlate product updates with user satisfaction.

### Action Center & Alerts
*   **Actions Tab**: A prioritized Kanban-style list of generated tasks (e.g., "High Impact: Fix battery drain").
*   **Alerts Tab**: Immediate red-flag notifications parsed from highly negative or aggressive customer emotions, allowing for instant customer-support intervention.

---

## 5. Security & Error Handling
*   **Secrets Management**: API keys and Database URIs are handled strictly via Environment Variables (`.env`) and are never exposed to the frontend.
*   **Graceful Degradation**: 
    1. If the primary Llama-3.3-70b model hits a rate limit, the system dynamically swaps to a fallback API key.
    2. If all LLM APIs fail, the pipeline falls back to a deterministic, local keyword-matching algorithm, guaranteeing the system never crashes and always returns structured data.
*   **CORS**: Configured on FastAPI to strictly allow communication only from the recognized Vercel frontend.

---
*Generated by ACVIS Engineering / Antigravity AI*
