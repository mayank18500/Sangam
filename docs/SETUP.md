# Developer Onboarding & Local Setup Guide — SANGAM

**Product Name:** Sangam  
**Tagline:** Where Travel Inventory Comes Together  
**Document Version:** 1.1.0  
**Target Environment:** Linux / macOS / WSL2 (Ubuntu 22.04+)  
**Last Updated:** November 2026  
**Related Documents:** [ARCHITECTURE.md](ARCHITECTURE.md) • [CONTRIBUTING.md](CONTRIBUTING.md) • [API.md](API.md)

---

## 1. Prerequisites & Required Tooling

Ensure the following runtimes are installed on your workstation before starting:

| Tool | Minimum Version | Verified Version | Purpose |
|---|---|---|---|
| **Node.js** | `>= 20.10.0` | `v20.20.2` | Runtime for Express server and Vite frontend |
| **npm** | `>= 10.0.0` | `12.2.1` | Package manager for monorepo workspaces |
| **Python** | `>= 3.11.0` | `3.14.8` | Runtime for FastAPI intelligence microservice |
| **PostgreSQL** | `>= 15.0` | `18.6` / `16-alpine` | Primary relational database |
| **Docker** | `>= 24.0.0` | `29.9.2` | Container runtime (optional for local DB) |
| **Git** | `>= 2.34.0` | `2.43.0+` | Version control system |

Verify installed versions:
```bash
node -v && npm -v && python3 --version && git --version
```

---

## 2. Repository Cloning & Structure Setup

Clone the repository to your local development directory:

```bash
git clone https://github.com/your-org/sangam.git
cd sangam
```

Directory structure layout:
```
sangam/
├── client/              # React 18, Vite, Tailwind CSS Frontend
├── server/              # Node.js, Express, TypeScript, Prisma Backend
├── intelligence/        # Python FastAPI Intelligence Service
├── datasets/            # Synthetic Hotel & Sightseeing Multi-Supplier Data
└── docs/                # Architecture, Database, and API Documentation
```

---

## 3. Environment Configuration

Copy all `.env.example` templates to their respective `.env` files:

```bash
# 1. Root Monorepo Environment
cp .env.example .env

# 2. Server Environment
cp server/.env.example server/.env

# 3. Client Environment
cp client/.env.example client/.env

# 4. Intelligence Environment
cp intelligence/.env.example intelligence/.env
```

### 3.1 Server Environment Settings (`server/.env`)
```env
PORT=4000
NODE_ENV=development

# Option A: Standard PostgreSQL TCP / Docker Compose:
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/sangam?schema=public"

# Option B: Local Unix Domain Socket (for local Linux setups):
# DATABASE_URL="postgresql://postgres@localhost:5433/sangam?host=/tmp"

JWT_SECRET=super-secure-sangam-jwt-secret-replace-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
INTELLIGENCE_SERVICE_URL=http://127.0.0.1:8000
```

### 3.2 Client Environment Settings (`client/.env`)
```env
VITE_API_URL=http://localhost:4000/api/v1
```

### 3.3 Intelligence Environment Settings (`intelligence/.env`)
```env
PORT=8000
AUTO_MATCH_THRESHOLD=0.85
REVIEW_REQUIRED_THRESHOLD=0.65
```

---

## 4. Database Setup & Initialization

### Option A: Using Docker (Recommended)
If you have Docker running locally, start PostgreSQL via Docker Compose:
```bash
docker compose up -d postgres
```

### Option B: Using Local Native PostgreSQL
If running PostgreSQL natively on Linux:
```bash
# Create the database and role
psql -U postgres -c "CREATE DATABASE sangam;"
psql -U postgres -c "CREATE ROLE babu WITH SUPERUSER LOGIN;"
```

---

## 5. Backend Installation, Migrations & Database Seeding

Navigate to the `server/` workspace, install dependencies, sync Prisma schema, and seed test data:

```bash
cd server

# 1. Install Node.js dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema directly to database
npx prisma db push

# 4. Seed database with synthetic multi-supplier hotels and tours
npx tsx prisma/seed.ts
```

Expected seed output:
```
🌱 Starting Sangam database seeding...
✅ Seeded 2 users: admin@sangam.travel, analyst@sangam.travel
✅ Seeded 6 suppliers
✅ Seeded 4 Canonical Entities
✅ Seeded 11 Supplier Listings across 6 suppliers
✅ Seeded Variants and Bookable Offers
✅ Seeded Match Audit Decisions and Ranking Results
🎉 Sangam database successfully seeded!
```

---

## 6. Python Intelligence Microservice Setup

Navigate to the `intelligence/` workspace, initialize a virtual environment, and install dependencies:

```bash
cd ../intelligence

# 1. Create Python virtual environment
python3 -m venv venv

# 2. Activate virtual environment
source venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

Verify the installation:
```bash
python3 -c "import fastapi, rapidfuzz, sklearn, pydantic; print('All ML/NLP libraries installed successfully!')"
```

---

## 7. Frontend Client Setup

Navigate to the `client/` workspace and install dependencies:

```bash
cd ../client

# Install frontend dependencies
npm install

# Verify Vite builds cleanly
npm run build
```

---

## 8. Running All Services Locally

For the best developer experience, open three terminal windows to run services independently:

### Terminal 1: Python Intelligence Service (Port 8000)
```bash
cd intelligence
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Endpoint: `http://127.0.0.1:8000`
- Swagger Interactive Docs: `http://127.0.0.1:8000/docs`
- Health check: `curl http://127.0.0.1:8000/health`

### Terminal 2: Express Backend Server (Port 4000)
```bash
cd server
npm run dev
```
- Endpoint: `http://localhost:4000`
- Health check: `curl http://localhost:4000/api/v1/health`

### Terminal 3: React Frontend SPA (Port 5173)
```bash
cd client
npm run dev
```
- Local URL: `http://localhost:5173`
- Default Admin Login: `admin@sangam.travel` / `Admin@123456`
- Default Analyst Login: `analyst@sangam.travel` / `Analyst@123456`

---

## 9. Running Automated Test Suites

### 9.1 Backend Integration Tests
Executes Vitest against the live PostgreSQL database:
```bash
cd server
npm test
```
Expected output:
```
✓ GET /api/v1/health should return status healthy and database connected
✓ GET /api/v1/suppliers should return seeded suppliers list
✓ GET /api/v1/analytics/overview should return real metrics
✓ GET /api/v1/inventory should return inventory listings
✓ POST /api/v1/auth/login should authenticate seeded user

Test Files:  1 passed (1)
Tests:       5 passed (5)
```

### 9.2 Python Intelligence Tests
Executes Pytest covering text normalization, RapidFuzz token matching, Haversine geo-distance, and offer ranking:
```bash
cd intelligence
source venv/bin/activate
python -m pytest
```
Expected output:
```
tests/test_matching.py ..                                     [ 28%]
tests/test_normalization.py ....                              [ 85%]
tests/test_ranking.py .                                       [100%]
============================== 7 passed in 0.30s ===============================
```

### 9.3 Monorepo Production Build Check
```bash
# From repository root
npm run build
```

---

## 10. Common Errors & Troubleshooting

### Issue 1: `PrismaClientInitializationError: Can't reach database server`
- **Cause:** PostgreSQL is not running or port/socket path in `DATABASE_URL` is incorrect.
- **Fix:** If using Docker, check `docker ps`. If running locally on Linux, verify socket path:
  ```bash
  # Check if postgres is listening
  ps aux | grep postgres
  ```

### Issue 2: `npm install blocked because they are not covered by allowScripts`
- **Cause:** Modern npm packages (`esbuild`, `@prisma/client`) block postinstall scripts by default in restrictive shell environments.
- **Fix:** Rebuild the binary directly:
  ```bash
  npm rebuild esbuild
  npx prisma generate
  ```

### Issue 3: `Address already in use: 4000` or `5173` or `8000`
- **Cause:** An existing instance of Node or Uvicorn is already occupying the port.
- **Fix:** Identify and terminate the orphaned process:
  ```bash
  lsof -ti:4000 | xargs kill -9 2>/dev/null || true
  lsof -ti:8000 | xargs kill -9 2>/dev/null || true
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  ```

### Issue 4: Python `ModuleNotFoundError: No module named 'rapidfuzz'`
- **Cause:** Virtual environment is either not activated or dependencies were installed to global Python.
- **Fix:** Ensure virtual environment is active before running commands:
  ```bash
  cd intelligence && source venv/bin/activate && pip install -r requirements.txt
  ```

---

## 11. Related Documentation Links

- [System Architecture](ARCHITECTURE.md)
- [Database Schema Reference](DATABASE.md)
- [API Reference](API.md)
- [Contributing Guidelines](CONTRIBUTING.md)

