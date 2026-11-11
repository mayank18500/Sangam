# SANGAM — AI-Powered Multi-Supplier Travel Inventory Intelligence

<div align="center">

```
   ███████╗ █████╗ ███╗   ██╗ ██████╗  █████╗ ███╗   ███╗
   ██╔════╝██╔══██╗████╗  ██║██╔════╝ ██╔══██╗████╗ ████║
   ███████╗███████║██╔██╗ ██║██║  ███╗███████║██╔████╔██║
   ╚════██║██╔══██║██║╚██╗██║██║   ██║██╔══██║██║╚██╔╝██║
   ███████║██║  ██║██║ ╚████║╚██████╔╝██║  ██║██║ ╚═╝ ██║
   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
```

### *Where Travel Inventory Comes Together.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

</div>

---

## 1. Executive Summary & Problem Statement

In the modern travel distribution ecosystem, Online Travel Agencies (OTAs), Bedbanks, Destination Management Companies (DMCs), and Corporate Travel Management Companies (TMCs) consume travel inventory feeds from dozens of third-party wholesalers and aggregators (e.g., Hotelbeds, WebBeds, Expedia Partner Solutions, local tour operators).

Because no universal Global Trade Item Number (GTIN) exists for travel inventory:
- **Differing Property Names:** The exact same hotel is listed as *"The Oberoi Grand Kolkata"*, *"The Oberoi Grand, Kolkata"*, or *"Oberoi Grand Hotel"*.
- **Discrepant Room Types:** Equivalent rooms are obscured by supplier-specific taxonomy (*"Deluxe King Courtyard"* vs. *"1 King Bed Deluxe"*).
- **Fragmented Experiences:** Identical sightseeing attractions are published with conflicting inclusion packages, cancellation terms, and markup schedules.
- **Destructive Merging Risk:** Naive deduplication overwrites supplier-specific IDs, descriptions, and booking conditions, causing downstream reservation failures.

**Sangam** solves this problem through an explainable, multi-vertical inventory intelligence platform that:
1. **Consolidates** multi-supplier inventory into verified canonical entities without destructive data loss.
2. **Identifies duplicates** using deterministic token matching (RapidFuzz), geospatial proximity (Haversine), and attribute deltas.
3. **Preserves** all raw supplier-specific codes, descriptions, and native JSON payloads.
4. **Normalizes** room categories, duration, transfers, and meal inclusions.
5. **Intelligently ranks** competing offers across price spread, supplier fulfillment reliability, cancellation flexibility, and value of inclusions.

---

## 2. Supported Travel Verticals

### 2.1 Hotels
- **Property Deduplication:** Multi-signal matching (RapidFuzz token sets, Haversine geo-distance, star rating variance, normalized addresses).
- **Room Category Matching:** Normalization of bed configurations, view types, and standard codes.
- **Content Normalization:** Canonical master profiles with consolidated amenities and physical attributes.
- **Price & Availability Comparison:** Side-by-side net rate and gross retail matrices.
- **Cancellation & Payment Policy Comparison:** Refundability status, penalty windows, and deadlines.
- **Supplier Reliability:** Dynamic weighting of historical fulfillment success rates.
- **Hotel Offer Ranking:** Multi-criteria weighted scoring engine.

### 2.2 Sightseeing & Activities
- **Attraction Deduplication:** Historical monuments, theme parks, and activity departure points.
- **Tour & Activity Matching:** Group vs. private tours, duration comparison (hours/days).
- **Inclusions & Exclusions:** Hotel pickup/drop, audio guides, forest permits, meal plans.
- **Access Types & Ticket Tiers:** Skip-the-line passes vs. standard museum entry.
- **Cancellation Policy Comparison:** Weather cancellation terms and penalty windows.
- **Experience Ranking:** Multi-criteria evaluation of activity offers.

---

## 3. Technology Stack & Architecture

Sangam is built as a modular monorepo cleanly separating frontend presentation, backend business logic, and high-performance Python intelligence computing:

```
┌─────────────────────────────────────────────────────────────┐
│                      SANGAM CLIENT                          │
│        React 18 + TypeScript + Vite + Tailwind CSS          │
│               Port 5173 (Single Page App)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON with JWT (Axios)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      SANGAM SERVER                          │
│            Node.js + Express.js + TypeScript                │
│                 Port 4000 (API Gateway)                     │
│        - Auth & Session (JWT + bcryptjs)                    │
│        - Ingest Pipeline & Inventory Management             │
│        - Prisma ORM (Relational Layer)                      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               │ Prisma Driver                 │ HTTP / REST
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│      POSTGRESQL DATABASE     │ │     SANGAM INTELLIGENCE      │
│   Neon / Docker Compatible   │ │    Python 3.14 + FastAPI     │
│   - JSONB flexible payloads  │ │          Port 8000           │
│   - 10 Relational Models     │ │ - RapidFuzz String Matching  │
│   - Audit Decision Logs      │ │ - Haversine Geo Proximity    │
└──────────────────────────────┘ │ - Multi-Criteria Ranker      │
                                 └──────────────────────────────┘
```

| Layer | Technologies | Role & Highlights |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Recharts, Lucide | Enterprise B2B SaaS dashboard, side-by-side match review queue, comparison matrix |
| **Backend** | Node.js 20, Express, TypeScript, Prisma ORM, Zod, JWT, bcryptjs | REST API Gateway, database access, ingest coordinator, RBAC authorization |
| **Intelligence** | Python 3.14, FastAPI, RapidFuzz, Scikit-learn, Pydantic v2, Uvicorn | Explainable token matching, Haversine geospatial proximity, multi-criteria offer ranker |
| **Database** | PostgreSQL 16+ (Neon-compatible), JSONB | 10 Relational Models enforcing non-destructive 4-tier inventory separation |

---

## 4. Platform UI & Visual Walkthrough

The Sangam dashboard adheres to an Indian-origin enterprise SaaS brand identity (Deep Navy `#0B192C`, Rich Teal `#0D9488`, Clean Slate `#F8FAFC`).

### 4.1 Dashboard Overview
Displays real-time platform KPIs, consolidation ratios, category distributions, and connected supplier feeds.
```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ SANGAM  |  Inventory Intelligence Overview                                [ Refresh Data ]│
├─────────────────┬─────────────────┬──────────────────────┬────────────────────────────────┤
│ Suppliers: 6    │ Listings: 11    │ Canonical: 4         │ Pending Reviews: 2             │
│ 100% active     │ Across feeds    │ Ratio: 2.75:1        │ Requires sign-off              │
├─────────────────┴─────────────────┴──────────────────────┴────────────────────────────────┤
│ [Deduplication Rate: 81.8%]  ████████████████████░░░░░░░░  Automated Acceptance           │
├───────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Inventory Consolidation (BarChart)│ Connected Suppliers (Table)                           │
│ Raw Feeds vs. Master Entities     │ BookingBridge Global (94% rel) • 4 listings           │
│ Hotels: 6 raw -> 2 canonical      │ GlobalBedBank B2B    (88% rel) • 3 listings           │
│ Sightseeing: 5 raw -> 2 canonical │ DirectConnect Travel (91% rel) • 2 listings           │
└───────────────────────────────────┴───────────────────────────────────────────────────────┘
```

### 4.2 Human-in-the-Loop Match Review
Side-by-side verification interface allowing analysts to inspect decomposed score components and confirm, reject, or split unconfirmed listings.
```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Side-by-Side Verification                                    [ Run AI Matching Engine ]   │
├─────────────────────────────────────────────┬─────────────────────────────────────────────┤
│ INBOUND SUPPLIER LISTING (Source)           │ TARGET CANONICAL PRODUCT (Proposed)         │
│ Name: "Taj Bengal Kolkata"                  │ Name: "Taj Palace New Delhi"                │
│ Supplier: BookingBridge (BB-HTL-99312)      │ Category: HOTEL (Delhi, India)              │
│ City: Kolkata, India                        │ Star: 5.0 ★                                 │
│                                             │                                             │
│ Status: REVIEW_REQUIRED (Score: 0.38)       │ City Mismatch Detected: Kolkata != Delhi    │
│ Explanation: Penalty applied (Score * 0.3)  │ Action: Do NOT merge distinct properties!   │
├─────────────────────────────────────────────┴─────────────────────────────────────────────┤
│ [ Reject Match ]                [ Split as New Canonical ]        [ Confirm Match ]       │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Multi-Supplier Offer Comparison Matrix
Normalizes competing supplier rates, cancellation deadlines, and inclusions for identical room categories.
```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Canonical Entity: The Oberoi Grand Kolkata                 [ Re-Rank Offers with AI ]     │
├──────────────────────────────┬──────────────────────────────┬─────────────────────────────┤
│ #1 BEST RECOMMENDATION ★     │ #2 SANGAM RANK               │ #3 SANGAM RANK              │
│ GlobalBedBank B2B            │ BookingBridge Global         │ DirectConnect Hospitality   │
│ Net Rate: $122.00 / night    │ Net Rate: $130.00 / night    │ Net Rate: $135.00 / night   │
│ Tax/Fees: $18.00             │ Tax/Fees: $15.00             │ Tax/Fees: $20.00            │
│ Reliability: 88%             │ Reliability: 94%             │ Reliability: 91%            │
│ Cancellation: Free up to 24h │ Cancellation: Free up to 48h │ Cancellation: NON-REFUNDABLE│
│ Meal Plan: Room Only         │ Meal Plan: Bed & Breakfast   │ Meal Plan: Bed & Breakfast  │
│ Transfers: Included (Bonus)  │ Transfers: Not Included      │ Transfers: Not Included     │
│ Overall Score: 89.2 / 100    │ Overall Score: 86.5 / 100    │ Overall Score: 71.0 / 100   │
└──────────────────────────────┴──────────────────────────────┴─────────────────────────────┘
```

---

## 5. Quick Start & Local Setup

### 5.1 Prerequisites
- Node.js `v20+` & npm `v10+`
- Python `3.11+`
- PostgreSQL `15+` (or Docker)

### 5.2 Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/sangam.git
cd sangam

# Copy environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
cp intelligence/.env.example intelligence/.env
```

### 5.3 Database Setup & Seeding
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 5.4 Running Services

#### Option A: Docker Compose
```bash
docker compose up --build
```

#### Option B: Independent Service Terminals
```bash
# Terminal 1: Python Intelligence Microservice (Port 8000)
cd intelligence
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Express Backend Server (Port 4000)
cd server
npm run dev

# Terminal 3: React Frontend Client (Port 5173)
cd client
npm install
npm run dev
```

### 5.5 Seeded Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@sangam.travel` | `Admin@123456` |
| **Operations Analyst** | `analyst@sangam.travel` | `Analyst@123456` |

---

## 6. Automated Testing & Verification

Sangam maintains automated test suites covering backend integration and Python intelligence algorithms:

```bash
# 1. Run Express Backend Integration Tests (Vitest against live DB)
cd server && npm test

# 2. Run Python Intelligence Tests (Pytest covering normalization & matching)
cd intelligence && pytest

# 3. Verify Production TypeScript Compilation
npm run build
```

---

## 7. Comprehensive Project Documentation

The complete documentation suite is located in the [`docs/`](docs/) directory:

| Document | Title | Purpose & Scope |
|---|---|---|
| **[01. PRD.md](docs/PRD.md)** | Product Requirements Document | Market problem, personas, functional & non-functional requirements, acceptance criteria. |
| **[02. ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System Architecture | Decoupled monorepo architecture, sequence diagrams, operational workflows, trade-offs. |
| **[03. DATABASE.md](docs/DATABASE.md)** | Database Design & ERD | Relational schema reference, 4-tier inventory model, JSONB strategies, indexing. |
| **[04. API.md](docs/API.md)** | Complete API Reference | All Express `/api/v1` and FastAPI endpoints, request/response examples, validation rules. |
| **[05. AI_ENGINE.md](docs/AI_ENGINE.md)** | Intelligence & Matching Engine | RapidFuzz formulas, Haversine spatial algorithms, offer ranking weights, benchmarks. |
| **[06. SETUP.md](docs/SETUP.md)** | Developer Setup Guide | Step-by-step onboarding, environment configurations, and troubleshooting solutions. |
| **[07. CONTRIBUTING.md](docs/CONTRIBUTING.md)** | Contribution Guidelines | Git branching strategy (`develop` based), PR requirements, coding standards. |
| **[08. ROADMAP.md](docs/ROADMAP.md)** | Product & Engineering Roadmap | Milestone breakdown from Hackathon MVP to commercial multi-tenant SaaS scaling. |
| **[09. DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md)** | Data Dictionary | Centralized field catalog, units of measurement, data constraints, enumerations. |
| **[10. SECURITY.md](docs/SECURITY.md)** | Security Architecture | JWT handling, bcrypt password hashing, RBAC, input sanitization, audit logging. |

---

## 8. Team Development & Collaboration Model

Sangam is built for a 3-developer team operating across decoupled workspaces:

```
main (Production Releases)
 │
 └── develop (Shared Integration & Staging)
      │
      ├── feature/frontend-<name>      # Member 1 (Client UI & Dashboards)
      ├── feature/backend-<name>       # Member 2 (Express, Ingest & Database)
      └── feature/intelligence-<name>  # Member 3 (Python Matching Engine)
```

- **Member 1 (Frontend & UI):** Owns `client/`. Consumes typed services in `client/src/services/`. Works on UI styling, Recharts visualizations, and interactive review queues.
- **Member 2 (Backend & Database):** Owns `server/` and `datasets/`. Manages Prisma schema migrations, Express modules, and PostgreSQL transactions.
- **Member 3 (Intelligence & Matching Engine):** Owns `intelligence/`. Improves RapidFuzz token cleaners, geospatial indexing, and multi-criteria ranking weights.

---

## 9. Product & Feature Roadmap

| Phase | Milestone | Focus Areas | Status |
|---|---|---|---|
| **Phase 1** | **Foundation** | Relational schema, Prisma ORM, Express Gateway, React dashboard shell | **Completed ✅** |
| **Phase 2** | **Intelligence** | RapidFuzz token matching, Haversine distance, room variant matching | **Completed ✅** |
| **Phase 3** | **Optimization** | Multi-criteria offer ranker, side-by-side human review UI, analytics | **Completed ✅** |
| **Phase 4** | **Hackathon Readiness** | Synthetic datasets, test coverage, comprehensive documentation suite | **Active 🔄** |
| **Phase 5** | **Commercial SaaS** | Redis streaming ingest, dense vector embeddings, live FX rates, multi-tenancy | Planned 🚀 |

---

## 10. License & Intellectual Property

Copyright © 2026 Sangam TravelTech Platform. All rights reserved.
Unauthorized copying or distribution of proprietary matching algorithms and data structures is strictly prohibited.
