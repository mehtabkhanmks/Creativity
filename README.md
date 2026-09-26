# ✨ Creativity

> **Universal Creative Asset & Intellectual Property Exchange**  
> *Where Vision Meets Capital — for creators, buyers, and innovators.*

---

## ✦ Overview

**Creativity** is a high-performance web platform designed to empower creators, authors, screenplay writers, audio producers, and software architects to publish, protect, monetize, and co-build original intellectual property.

Whether licensing rights, selling creative assets outright, or forming collaborative revenue-share teams, Creativity bridges the gap between raw creative vision and capital.

---

## 🚀 Key Features

- **🏛️ High-End Curated Marketplace:** Browse verified manuscripts, screenplays, audio scores, architectural blueprints, and algorithm assets.
- **🤝 Collaboration Hub:** Discover projects seeking co-creators, apply for revenue-share roles, and form interdisciplinary production teams.
- **🛡️ Master Admin Gate:** Dedicated verification dashboard (`/admin`) for inspecting content, managing users, and monitoring platform metrics.
- **🔐 Multi-Role Authentication:** Streamlined login system supporting Creators, Buyers, and Collaborators with simulated/live Gmail verification codes and Google OAuth.
- **⚡ Modern Responsive UI:** Architectural luxury aesthetic powered by custom CSS tokens, micro-animations, and fluid typography.

---

## 🛠️ Tech Stack

- **Frontend:**
  - [React 19](https://react.dev/) + [Vite](https://vite.dev/)
  - [React Router 7](https://reactrouter.com/) (Declarative Client Routing)
  - [Lucide Icons](https://lucide.dev/) & [React Hot Toast](https://react-hot-toast.com/)
  - Custom Vanilla CSS Design System (Zero Tailwind dependencies)
- **Backend:**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Sequelize ORM](https://sequelize.org/) with [SQLite](https://www.sqlite.org/)
  - JWT Authentication & Bcrypt hashing
  - Helmet security headers & CORS policy

---

## 📂 Project Architecture

```
MY New Idea/
├── client/                 # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── api/            # Axios API client & interceptors
│   │   ├── components/     # Navbar, Footer, ListingCard, etc.
│   │   ├── context/        # Auth & Global state context
│   │   ├── pages/          # Landing, Marketplace, Collaborate, Admin, etc.
│   │   └── index.css       # Creativity Design System
│   ├── .env.example        # Client environment template
│   ├── vercel.json         # Vercel SPA rewrite configuration
│   └── package.json
├── server/                 # Express REST API Backend
│   ├── src/
│   │   ├── controllers/    # API endpoints logic
│   │   ├── middleware/     # Auth, error handling, upload filters
│   │   ├── models/         # Sequelize database models
│   │   ├── routes/         # REST API routers
│   │   └── utils/          # Database seeding & email service
│   ├── .env.example        # Server environment template
│   └── package.json
├── vercel.json             # Root Vercel deployment configuration
├── package.json            # Monorepo development scripts
└── README.md
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/creativity.git
cd creativity
```

### 2. Configure Environment Variables
Copy the `.env.example` templates in both `client` and `server`:
```bash
# In client/
cp client/.env.example client/.env

# In server/
cp server/.env.example server/.env
```

### 3. Install Dependencies
```bash
npm run install:all
```
*(Or navigate to `client/` and `server/` separately and run `npm install`)*

### 4. Seed Database & Start Backend
```bash
cd server
npm run seed
npm run dev
```
The server will start at `http://localhost:5000`.

### 5. Start Frontend Dev Server
In a new terminal window:
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🛡️ Default Admin Credentials

To access the platform's Master Admin Portal at `/admin`:
- **Email:** `admin@creativity.io`
- **Password:** `password123`
*(A 1-Click Autofill button is also available directly on the admin gate screen for seamless testing).*

---

## 🌐 Deploying to Vercel & GitHub

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: rebrand to Creativity and prepare for GitHub and Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/creativity.git
git push -u origin main
```

### Step 2: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your imported `creativity` GitHub repository.
3. Configure settings:
   - **Framework Preset:** Vite
   - **Root Directory:** Either `./` (Root) or `client` (Both are pre-configured with `vercel.json` rewrite rules).
   - **Environment Variables:** Add `VITE_API_URL` pointing to your deployed backend API (or leave blank for local dev).
4. Click **Deploy**. Your frontend is live with instantaneous global edge routing!

---

## 📄 License
ISC © 2026 Creativity. All rights reserved.
