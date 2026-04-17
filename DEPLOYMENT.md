# ACVIS Deployment Guide

Production deployment uses **Render** (backend) + **Vercel** (frontend) + **MongoDB Atlas** (database).

---

## Step 1: MongoDB Atlas (Database)

> You likely already have this set up. If not:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
2. Create a database user with read/write access
3. In **Network Access**, add `0.0.0.0/0` (allow from anywhere) for Render/Vercel
4. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/acvis?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend on Render

### Option A: Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect the GitHub repo `MohithGowda2807/ACVIS`
4. Render will auto-detect `render.yaml` and set up the service

### Option B: Manual Setup
1. Click **New** → **Web Service**
2. Connect the GitHub repo `MohithGowda2807/ACVIS`
3. Configure:
   - **Name**: `acvis-api`
   - **Runtime**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`

### Environment Variables (set in Render dashboard)

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `mongodb+srv://...` (your Atlas connection string) |
| `JWT_SECRET` | Any long random string (Render can auto-generate) |
| `FRONTEND_ORIGINS` | `https://acvis.vercel.app` (your Vercel domain, set after Step 3) |
| `PYTHON_VERSION` | `3.12.8` |

After deploying, note your backend URL: `https://acvis-api.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com) and click **Add New** → **Project**
2. Import the GitHub repo `MohithGowda2807/ACVIS`
3. Configure:
   - **Root Directory**: `frontend-react`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables (set in Vercel dashboard)

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://acvis-api.onrender.com/api` |

4. Click **Deploy**

After deploying, note your frontend URL (e.g. `https://acvis.vercel.app`)

---

## Step 4: Connect Frontend ↔ Backend

1. Go back to **Render** dashboard → your `acvis-api` service → **Environment**
2. Set `FRONTEND_ORIGINS` to your Vercel URL: `https://acvis.vercel.app`
   - For multiple origins, comma-separate: `https://acvis.vercel.app,https://acvis-mohith.vercel.app`
3. Render will auto-redeploy with the updated CORS setting

---

## Step 5: Verify

1. Open your Vercel URL → you should see the ACVIS landing page
2. Register a new account → login
3. Go to **Analyze Data** → **Sample Data** → click **Analyze Amazon Reviews**
4. Verify all dashboard pages populate with data

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Vercel (Frontend)  │ ──API──▶│   Render (Backend)    │
│   React + Vite       │         │   FastAPI + Python     │
│   Static SPA         │         │   NLP Pipeline         │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │   MongoDB Atlas       │
                                │   acvis database      │
                                └──────────────────────┘
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Ensure `FRONTEND_ORIGINS` on Render matches your exact Vercel URL (no trailing slash) |
| 404 on page refresh | `vercel.json` rewrites should handle this automatically |
| Backend health check fails | Check Render logs — likely `MONGO_URI` is wrong or Atlas network access blocked |
| Login not working | Check `JWT_SECRET` is set on Render |
| Pipeline returns empty | Verify `amazon_reviews_sample.json` is committed to the repo root |

## For Collaborators

Your friends with repo access don't need to do anything special:
- The deployment auto-deploys on every `git push` to the main branch
- They should NOT commit `.env` files (blocked by `.gitignore`)
- They can run locally using the existing `backend/.env` and `npm run dev`
