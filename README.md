# Supply Chain Sentinel — Backend API

Node.js + Express + PostgreSQL REST API for the Supply Chain Sentinel frontend.  
Mirrors the frontend's risk engine exactly so scores are consistent whether computed client-side or server-side.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Runtime     | Node.js 18+                       |
| Framework   | Express 4                         |
| Database    | PostgreSQL 14+                    |
| Auth        | JWT (jsonwebtoken + bcryptjs)     |
| Weather     | OpenWeatherMap API (mock fallback)|
| Email       | Nodemailer (SMTP)                 |
| Scheduling  | node-cron                         |
| Logging     | Winston                           |

---

## Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14 running locally (or a cloud instance)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env – set DB_PASSWORD, JWT_SECRET at minimum
```

### 4. Create the database
```bash
psql -U postgres -c "CREATE DATABASE supply_chain_sentinel;"
```

### 5. Run migrations
```bash
npm run migrate
```

### 6. Seed with sample data
```bash
npm run seed
```
This creates two users and runs an analysis with the 10 sample suppliers from the frontend.

| Email                      | Password     | Role    |
|----------------------------|--------------|---------|
| admin@sentinel.local       | admin123     | admin   |
| analyst@sentinel.local     | analyst123   | analyst |

### 7. Start the server
```bash
npm run dev        # development (nodemon)
npm start          # production
```

Server starts on **http://localhost:5000**

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

### Auth

| Method | Path                     | Description              |
|--------|--------------------------|--------------------------|
| POST   | `/api/auth/register`     | Register a new user      |
| POST   | `/api/auth/login`        | Login, receive JWT       |
| GET    | `/api/auth/me`           | Get current user profile |

#### POST /api/auth/login
```json
{ "email": "admin@sentinel.local", "password": "admin123" }
```
Response:
```json
{ "user": { "id": "...", "name": "Admin", "role": "admin" }, "token": "eyJ..." }
```

---

### Analysis

| Method | Path                          | Description                             |
|--------|-------------------------------|-----------------------------------------|
| POST   | `/api/analysis`               | Run risk analysis on supplier list      |
| GET    | `/api/analysis`               | List past analysis runs (paginated)     |
| GET    | `/api/analysis/latest/summary`| Summary of most recent run              |
| GET    | `/api/analysis/:id`           | Full run detail with alerts             |
| DELETE | `/api/analysis/:id`           | Delete a run (admin only)               |

#### POST /api/analysis — Request body
```json
{
  "label": "Q2 2025 review",
  "suppliers": [
    {
      "name": "ABC Corp",
      "city": "Shanghai",
      "dependency": "High",
      "category": "Electronics",
      "tier": "Tier 1",
      "parent_supplier": ""
    }
  ]
}
```

**Dependency values:** `"High"` | `"Medium"` | `"Low"`

#### Response
```json
{
  "id": "uuid",
  "summary": {
    "total": 10,
    "high": 4,
    "medium": 3,
    "low": 3,
    "avgScore": 58,
    "criticalNodes": 2,
    "spof": 1,
    "cascading": 3
  },
  "suppliers": [ /* AnalyzedSupplier[] */ ],
  "alerts": [ /* Alert[] */ ]
}
```

---

### Suppliers

| Method | Path                       | Description                                    |
|--------|----------------------------|------------------------------------------------|
| GET    | `/api/suppliers`           | List suppliers (filter, sort, paginate)        |
| GET    | `/api/suppliers/stats`     | Aggregate stats + breakdowns                   |
| GET    | `/api/suppliers/:id`       | Single supplier                                |
| GET    | `/api/suppliers/:id/history` | Risk score trend across past runs            |
| PATCH  | `/api/suppliers/:id`       | Update tier / notes / parent (analyst+)        |
| DELETE | `/api/suppliers/:id`       | Delete supplier (admin only)                   |

**GET /api/suppliers query params:**

| Param      | Example          | Description                           |
|------------|------------------|---------------------------------------|
| page       | `1`              | Page number                           |
| limit      | `20`             | Results per page (max 100)            |
| search     | `ABC`            | Full-text search on name/city/category|
| riskLevel  | `High`           | Filter by risk level                  |
| dependency | `High`           | Filter by dependency                  |
| category   | `Electronics`    | Filter by category                    |
| sortBy     | `risk_score`     | Sort field                            |
| order      | `desc`           | `asc` or `desc`                       |

---

### Alerts

| Method | Path                          | Description                         |
|--------|-------------------------------|-------------------------------------|
| GET    | `/api/alerts`                 | List alerts (filter, paginate)      |
| GET    | `/api/alerts/summary`         | Count by severity + status          |
| GET    | `/api/alerts/:id`             | Single alert                        |
| PATCH  | `/api/alerts/:id/acknowledge` | Mark as acknowledged                |
| PATCH  | `/api/alerts/:id/resolve`     | Mark as resolved                    |
| PATCH  | `/api/alerts/:id/dismiss`     | Dismiss (analyst+ only)             |
| DELETE | `/api/alerts/:id`             | Delete (admin only)                 |

---

### Dashboard

| Method | Path                              | Description                                |
|--------|-----------------------------------|--------------------------------------------|
| GET    | `/api/dashboard/kpis`             | 6 KPI card values                          |
| GET    | `/api/dashboard/risk-distribution`| Chart data: by level, country, category    |
| GET    | `/api/dashboard/trend`            | Risk score trend over past N runs          |
| GET    | `/api/dashboard/recommendations`  | Top N high-risk suppliers + recommendations|
| GET    | `/api/dashboard/alerts-feed`      | Open/acknowledged alerts for live panel    |

---

### Users (admin only for list/edit)

| Method | Path                    | Description                    |
|--------|-------------------------|--------------------------------|
| GET    | `/api/users`            | List all users (admin)         |
| PATCH  | `/api/users/me`         | Update own profile             |
| PATCH  | `/api/users/me/password`| Change own password            |
| PATCH  | `/api/users/:id`        | Change role/active (admin)     |
| DELETE | `/api/users/:id`        | Delete user (admin)            |

---

## CSV Upload

The frontend uploads a CSV with the header:
```
name,city,dependency,category,tier,parent_supplier
```

To process this on the backend, parse the CSV client-side (as the frontend already does with PapaParse) and POST the resulting array to `POST /api/analysis`.

Alternatively, add a multipart file upload endpoint using `multer` if you want pure server-side CSV handling.

---

## Scheduled Re-analysis

The server runs a cron job (default: every hour) that re-fetches weather for all stored suppliers and re-runs the full risk engine. Configure the schedule in `.env`:

```
CRON_SCHEDULE=0 * * * *   # every hour (default)
CRON_SCHEDULE=*/30 * * * *  # every 30 minutes
```

---

## Email Alerts

Critical and high-severity alerts are emailed to all users with `receive_alerts = TRUE`.  
Configure SMTP in `.env`. To opt out, users can `PATCH /api/users/me` with `{ "receive_alerts": false }`.

---

## Project Structure

```
supply-chain-sentinel-backend/
├── src/
│   ├── app.js                    # Express app (middleware + routes)
│   ├── server.js                 # Entry point
│   ├── config/
│   │   ├── db.js                 # PostgreSQL pool
│   │   └── logger.js             # Winston logger
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js       # Global error handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── analysis.js
│   │   ├── suppliers.js
│   │   ├── alerts.js
│   │   ├── dashboard.js
│   │   └── users.js
│   └── services/
│       ├── riskEngine.js         # JS port of frontend risk-engine.ts
│       ├── weatherService.js     # OpenWeatherMap + mock fallback
│       ├── emailService.js       # Nodemailer alert emails
│       ├── analysisService.js    # Orchestrates analysis + DB persist
│       └── scheduler.js          # node-cron scheduled re-analysis
├── migrations/
│   ├── migrate.js                # Creates all tables
│   └── seed.js                   # Seeds sample data + users
├── logs/                         # Winston log files (gitignored)
├── .env.example
├── .gitignore
└── package.json
```

---

## Connecting to the Frontend

In your Vite frontend, set:
```
VITE_API_URL=http://localhost:5000/api
```

Then replace the `fetchWeather` + `analyze` calls in `Index.tsx` with API calls to `POST /api/analysis`.
