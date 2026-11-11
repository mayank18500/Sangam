# SANGAM — AI-Powered Multi-Supplier Travel Inventory Intelligence

> **Where Travel Inventory Comes Together.**

Sangam is a production-minded B2B TravelTech SaaS platform engineered to solve the problem of fragmented and duplicated travel inventory across multiple global and regional suppliers. 

Different suppliers list the same hotel or experience using conflicting names, non-standardized room descriptions, varying prices, and disparate booking conditions. Sangam consolidates this inventory into verified canonical entities, identifies duplicates with explainable confidence scoring, preserves raw supplier data non-destructively, and ranks multi-supplier offers on a multi-criteria basis.

---

## 1. System Architecture & Tech Stack

```
sangam/
├── client/              # React 18, Vite, TypeScript, Tailwind CSS, Recharts
├── server/              # Node.js, Express, TypeScript, Prisma ORM, Zod, JWT
├── intelligence/        # Python 3.14, FastAPI, RapidFuzz, Scikit-learn, Uvicorn
├── datasets/            # Synthetic Hotel & Sightseeing Multi-Supplier Data
├── docs/                # PRD.md, ARCHITECTURE.md, DATABASE.md, API.md
├── docker-compose.yml   # PostgreSQL 16, Service Containers & Volumes
└── package.json         # Monorepo Scripts
```

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router, Recharts, Lucide | Enterprise B2B SaaS Dashboard, side-by-side match reviews, comparison matrix |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT, bcryptjs | REST API Gateway, database access, auth, ingest pipelines |
| **Intelligence** | Python 3.14, FastAPI, RapidFuzz, Pydantic, Scikit-learn | Explainable fuzzy string matching, Haversine geo proximity, multi-criteria offer ranking |
| **Database** | PostgreSQL 16+ (Neon-compatible), JSONB | 10 Relational Models, audit trails, flexible attributes |

---

## 2. Core Initial Scope

1. **Hotels:** Property deduplication, room category matching, content normalization, price comparison, cancellation policy comparison, and offer ranking.
2. **Sightseeing:** Attraction deduplication, tour matching, duration comparison, transfers & meals analysis, access types, and cancellation comparison.

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js `v20+` & npm `v10+`
- Python `3.11+`
- PostgreSQL `16+` (or Docker)

### 3.1 Clone & Environment Setup

```bash
git clone https://github.com/your-org/sangam.git
cd sangam

# Copy environment template
cp .env.example .env
cp server/.env.example server/.env
cp intelligence/.env.example intelligence/.env
cp client/.env.example client/.env
```

### 3.2 Database Setup & Seeding

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Push schema to PostgreSQL
npx prisma db push

# 3. Seed synthetic multi-supplier dataset
npx tsx prisma/seed.ts
```

### 3.3 Running the Services

#### Option A: Docker Compose (All-in-One)
```bash
docker compose up --build
```

#### Option B: Independent Service Execution (Recommended for Team Developers)

**Terminal 1 — Express Backend API (Port 4000):**
```bash
cd server
npm run dev
# Health check: http://localhost:4000/api/v1/health
```

**Terminal 2 — Python Intelligence Service (Port 8000):**
```bash
cd intelligence
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Health check: http://localhost:8000/health
```

**Terminal 3 — React Client Dashboard (Port 5173):**
```bash
cd client
npm install
npm run dev
# Accessible at: http://localhost:5173
```

---

## 4. Default Seeded Accounts & Sample Data

### Demo User Accounts
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@sangam.travel` | `Admin@123456` |
| **Analyst** | `analyst@sangam.travel` | `Analyst@123456` |

### Seeded Synthetic Travel Inventory
- **Hotels:**
  - *The Oberoi Grand Kolkata* (Ingested across BookingBridge, GlobalBedBank, and DirectConnect).
  - *Taj Palace New Delhi* (Ingested across BookingBridge and GlobalBedBank).
  - *Taj Bengal Kolkata* (Genuinely distinct property flagged for human review).
- **Sightseeing:**
  - *Victoria Memorial Kolkata* vs *Victoria Memorial Hall Guided Tour*.
  - *Sundarbans boat tour* vs *Sundarbans mangrove cruise*.
  - *Belur Math Cultural Tour* (Distinct experience).

---

## 5. Verification & Test Execution

Run the automated test suites across both backend and intelligence services:

```bash
# Test Express Backend API (5/5 integration tests against live DB)
npm run test:server

# Test Python Intelligence Engine (7/7 unit tests)
npm run test:intelligence

# Run Typecheck & Production Builds
npm run build
```

---

## 6. Team Development & Collaboration Strategy

This project is structured for a 3-person engineering team:

### Member Responsibilities
- **Member 1 (Frontend & UI):** Owns `client/`. Consumes typed services in `client/src/services/`. Works on UI styling, Recharts visualizations, and interactive review queues.
- **Member 2 (Backend & Database):** Owns `server/` and `datasets/`. Manages Prisma schema migrations, Express modules, and PostgreSQL transactions.
- **Member 3 (Intelligence & Matching Engine):** Owns `intelligence/`. Improves RapidFuzz token cleaners, geospatial indexing, and multi-criteria ranking weights.

### Git Branching Model
1. `main` — Production-ready, passing all CI tests and builds.
2. `develop` — Shared staging branch for sprint releases.
3. Feature Branches:
   - `feat/client-<feature>` (Member 1)
   - `feat/server-<feature>` (Member 2)
   - `feat/ai-<feature>` (Member 3)

Pull Requests require passing unit tests and schema coordination before merging into `develop`.

---

## 7. Known Limitations & Next Steps

1. **Embedding Models (Vector Search):** Initial implementation relies deterministically on RapidFuzz token set ratios and Haversine spatial proximity. Sentence-Transformers/embeddings can be enabled as an optional hybrid ranker.
2. **Real-time Supplier Webhooks:** Currently supports batch ingest tracking; real-time asynchronous streaming via Redis streams is scheduled for Phase 2.
3. **Multi-Currency FX Rates:** Default prices are normalized to USD; live FX conversion layer will be integrated with commercial rate providers.
