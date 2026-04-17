# ACVIS Deployment

This repo is set up for:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 1. Deploy the backend on Render

- Create a new Render web service from this repo, or use `render.yaml`.
- Set the service root directory to `backend` if you configure it manually.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/health`

Set these environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_ORIGINS`

Example:

```env
FRONTEND_ORIGINS=https://your-frontend-domain.vercel.app
```

## 2. Deploy the frontend on Vercel

- Import this repo into Vercel
- Set the root directory to `frontend-react`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Set this environment variable:

- `VITE_API_BASE_URL`

Example:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

## 3. Important notes

- `frontend-react/vercel.json` rewrites all routes to `index.html` so React Router works on refresh.
- The frontend now uses `VITE_API_BASE_URL` in production and still falls back to `/api` for local development.
- The backend now reads `FRONTEND_ORIGINS` so CORS can be locked to your deployed frontend domain.
