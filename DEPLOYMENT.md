# 🚀 Creativity Deployment Guide

This guide walks you through deploying the **Creativity** platform to **GitHub** and **Vercel** (for the frontend), along with hosting options for the backend.

---

## 1. Pushing to GitHub

Ensure you are in the project root directory:

```bash
# Initialize git if not already initialized
git init

# Check staged files (sensitive files like .env and node_modules are ignored automatically)
git status

# Add files and commit
git add .
git commit -m "feat: Initial commit for Creativity platform"

# Rename branch to main
git branch -M main

# Add your GitHub remote repository
# Replace YOUR_GITHUB_USERNAME and REPO_NAME with your actual values:
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

---

## 2. Deploying Frontend to Vercel

Vercel is the recommended hosting platform for the Vite/React frontend.

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository (`creativity`).
4. Set Project Configuration:
   - **Root Directory:** If prompted, choose `./` or `client`. Both work out of the box because `vercel.json` files are prepared in both locations.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist` (or `client/dist` if root was selected)
5. **Environment Variables**:
   - Add `VITE_API_URL`: URL of your deployed backend (e.g. `https://your-api.onrender.com/api`).
   *(For offline or standalone preview, you can omit this; fallback and mock states are included).*
6. Click **Deploy**.
7. Once deployed, all React Router routes (`/buy`, `/sell`, `/collaborate`, `/admin`) will resolve cleanly without 404 errors thanks to the included SPA rewrites.

---

## 3. Deploying the Backend API (Render / Railway)

Because the backend uses Node.js/Express, we recommend **Render** or **Railway**:

### Deploying to Render.com:
1. Create a free account at [render.com](https://render.com).
2. Click **"New +"** -> **"Web Service"**.
3. Connect your GitHub repository.
4. Configure service:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run seed && npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(A secure random string)*
   - `CLIENT_URL`: `https://your-creativity-frontend.vercel.app`
6. Click **Create Web Service**.
7. Copy the service URL (e.g., `https://creativity-api.onrender.com`) and paste `https://creativity-api.onrender.com/api` into your Vercel `VITE_API_URL` environment variable!

---

## 4. Verification Checklist

- [x] Application rebranded to **Creativity**
- [x] Root `.gitignore` prevents leaks of `.env`, `database.sqlite`, and `node_modules`
- [x] `.env.example` templates created for client and server
- [x] `vercel.json` configured with SPA routing rules
- [x] Master Admin Portal (`/admin`) login verified (`admin@creativity.io` / `password123`)
