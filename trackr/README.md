# 📒 Trackr — Self-Tracking Documentation Web App

A unified workspace combining documentation, study tracking, gym logging, goal management, and analytics.

---

## 🏗️ Architecture

```
trackr/
├── client/                        # Vite + React Frontend
│   └── src/
│       ├── components/
│       │   ├── layout/            # Sidebar, Navbar, Layout
│       │   ├── ui/                # Reusable UI primitives
│       │   └── charts/            # Chart components
│       ├── pages/                 # Route-level pages
│       ├── context/               # Global state (AuthContext, AppContext)
│       ├── hooks/                 # Custom React hooks
│       └── lib/                   # API client, helpers
│
└── server/                        # Node.js + Express Backend
    └── src/
        ├── models/                # Mongoose schemas
        ├── routes/                # Express route handlers
        ├── controllers/           # Business logic
        └── middleware/            # Auth, error handling

```

---

## 🚀 Quick Start

```bash
# Backend
cd server && npm install
cp .env.example .env       # Fill in your MONGODB_URI and JWT_SECRET
npm run seed               # Seed demo data
npm run dev                # → http://localhost:5000

# Frontend
cd client && npm install
npm run dev                # → http://localhost:5173
```

Demo login: `demo@trackr.app` / `Demo@123`

---

## 📡 API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Current user |

### Notes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/notes | All notes |
| POST | /api/notes | Create note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note |

### Study
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/study/logs | All study logs |
| POST | /api/study/logs | Log study session |
| GET | /api/study/stats | Aggregated stats |
| GET | /api/study/subjects | All subjects |

### Gym
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/gym/logs | All workout logs |
| POST | /api/gym/logs | Log workout |
| GET | /api/gym/stats | Aggregated stats |

### Goals
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/goals | All goals |
| POST | /api/goals | Create goal |
| PUT | /api/goals/:id | Update goal |
| DELETE | /api/goals/:id | Delete goal |

### Daily Log
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/daily | All daily logs |
| POST | /api/daily | Upsert today's log |
| GET | /api/daily/streak | Current streak |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/dashboard | Full dashboard stats |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite, React 18, React Router v6 |
| Styling | Tailwind CSS v3 |
| State | Context API + useReducer |
| Charts | Recharts |
| Markdown | react-md-editor |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
