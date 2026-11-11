# Product & Engineering Roadmap — SANGAM

**Product Name:** Sangam  
**Tagline:** Where Travel Inventory Comes Together  
**Document Version:** 1.1.0  
**Current Milestone:** Phase 4 (Hackathon Readiness) & Transition to Phase 5 (Startup Expansion)  
**Last Updated:** November 2026  
**Related Documents:** [PRD.md](PRD.md) • [ARCHITECTURE.md](ARCHITECTURE.md) • [AI_ENGINE.md](AI_ENGINE.md)

---

## 1. Roadmap Overview & Strategic Horizon

The Sangam development lifecycle is organized into five structured phases spanning hackathon MVP deployment to full commercial B2B SaaS scaling:

```
[ Phase 1: Foundation ] ──► [ Phase 2: Intelligence ] ──► [ Phase 3: Optimization ] ──► [ Phase 4: Hackathon ] ──► [ Phase 5: Commercial SaaS ]
     (COMPLETED)                  (COMPLETED)                  (COMPLETED)              (CURRENT / ACTIVE)            (PLANNED HORIZON)
```

---

## 2. Phase-by-Phase Execution Breakdown

### Phase 1: Architectural Foundation (COMPLETED ✅)
Focus: Establishing the decoupled monorepo, relational schema, security layer, and foundational CRUD endpoints.

- [x] **Monorepo Architecture:** Structured `client/`, `server/`, `intelligence/`, `datasets/`, `docs/`.
- [x] **Relational PostgreSQL Schema:** Implemented 10 Prisma models enforcing non-destructive 4-tier inventory separation.
- [x] **Authentication & RBAC:** Implemented JWT stateless auth, bcrypt password hashing, role guards (`ADMIN`, `ANALYST`, `VIEWER`).
- [x] **Supplier Ingest Gateway:** CRUD endpoints for supplier registration, reliability scores, and batch import logging.
- [x] **Dashboard Shell:** Vite + React + Tailwind enterprise UI with dark navy and teal palette.
- [x] **Docker Infrastructure:** Configured `docker-compose.yml` for PostgreSQL and independent microservices.

---

### Phase 2: Intelligence & Deduplication Engine (COMPLETED ✅)
Focus: Implementing deterministic fuzzy token matching, geospatial proximity, and confidence scoring.

- [x] **Category-Specific Text Normalization:** Cleansed domain noise tokens (`hotel`, `resort`, `palace`, `tour`, `guided`, `ticket`).
- [x] **Spatial Haversine Algorithm:** Implemented great-circle proximity decay with $1.5\text{ km}$ maximum radius.
- [x] **RapidFuzz Lexical Scoring:** Weighted hybrid combining `token_set_ratio` ($70\%$) and direct `ratio` ($30\%$).
- [x] **Attribute Delta Modeling:** Star rating variance penalty ($0.3$ penalty per star differential).
- [x] **City Mismatch Guardrail:** Implemented heavy penalty ($0.3\times$ multiplier) preventing cross-city false merges.
- [x] **Variant Normalization:** Implemented room category and ticket tier matching via `fuzz.token_sort_ratio`.
- [x] **Confidence Gate Logic:** Decomposed scoring into `AUTO_MATCHED` ($\ge 0.85$), `REVIEW_REQUIRED` ($0.65 \dots 0.84$), and `UNMATCHED` ($< 0.65$).

---

### Phase 3: Offer Intelligence & Operations (COMPLETED ✅)
Focus: Offer comparison matrices, multi-criteria ranking, and human-in-the-loop review operations.

- [x] **Human Review Queue:** Interactive side-by-side UI allowing analysts to Confirm, Reject, or Split candidate listings.
- [x] **Split Action Implementation:** Database logic creating new canonical entities from distinct listings during review.
- [x] **Offer Comparison Matrix:** Multi-supplier price, policy, and inclusion comparison grid.
- [x] **Multi-Criteria Offer Ranker:** Configurable weighted scoring evaluating Price ($40\%$), Reliability ($25\%$), Cancellation ($20\%$), and Inclusions ($15\%$).
- [x] **Platform Analytics Overview:** Real-time deduplication rates, consolidation ratios, and Recharts graphs.
- [x] **Audit Trail Persistence:** Implemented immutable `match_decisions` logging every automated and manual decision.

---

### Phase 4: Hackathon Readiness & Demonstration (CURRENT / IN PROGRESS 🔄)
Focus: End-to-end evaluation, synthetic multi-supplier datasets, documentation, and live demo polish.

- [x] **Synthetic Travel Datasets:** Comprehensive multi-supplier feeds for Hotels (Kolkata, Delhi) and Sightseeing (Victoria Memorial, Sundarbans).
- [x] **Automated Test Suites:** Vitest backend integration tests ($5/5$ passing) and Pytest intelligence tests ($7/7$ passing).
- [x] **Production Build Verification:** Clean TypeScript compilation with zero warnings or errors.
- [x] **Comprehensive Documentation Suite:** Complete 10-document reference under `docs/`.
- [ ] **Live Video Walkthrough / Presentation:** Screen recording demonstrating live auto-match and side-by-side split review.
- [ ] **Demo Seed Refresh Script:** One-command database reset for reproducible live judging presentations.

---

### Phase 5: Commercial Startup Expansion (PLANNED HORIZON 🚀)
Focus: Production-grade cloud deployment, live supplier integrations, multi-tenancy, and advanced NLP.

#### 5.1 Ingestion & Connectivity
- [ ] **Real-time Supplier Streaming:** Ingestion worker pool backed by Redis Streams / BullMQ to handle live XML/JSON feeds from Hotelbeds, Sabre, and Amadeus.
- [ ] **Automated Supplier Webhook Alerts:** Webhook dispatching notifying client OTAs when duplicate inventory is merged or unlinked.
- [ ] **Live FX Currency Conversion:** Integration with OpenExchangeRates to support dynamic multi-currency rate comparison.

#### 5.2 AI & Deep Learning
- [ ] **Dense Vector Embeddings:** Hybrid search pipeline integrating `sentence-transformers` (`all-MiniLM-L6-v2`) via pgvector for semantic room matching.
- [ ] **Geocoding Fallback Engine:** Automatic geocoding resolver via OpenStreetMap Nominatim for listings missing GPS coordinates.
- [ ] **Computer Vision Image Deduplication:** Perceptual hashing (pHash) on hotel facade photos to confirm disputed property matches.

#### 5.3 Enterprise Platform & Commercialization
- [ ] **Multi-Tenant Organization RBAC:** Tenant isolation enabling multiple independent travel agencies to manage private supplier credentials on one instance.
- [ ] **Automated Booking Router:** API proxy dispatching live booking reservations directly to the winning supplier's reservation endpoint.
- [ ] **Custom Client Ranking Policies:** Allows each enterprise client to calibrate their own rank weights (e.g., TMC prioritizing flexible cancellation vs. budget OTA prioritizing net price).
- [ ] **Additional Verticals:** Extending schema and matching rules to Flights, Intercity Rail, and Car Rentals.

---

## 3. Milestones Timeline

| Target Date | Milestone | Deliverable | Status |
|---|---|---|---|
| **Nov 2026** | **Phase 1-3 Release** | Complete local runnable monorepo with Express, FastAPI, React, and PostgreSQL | **Done** |
| **Nov 2026** | **Phase 4 Hackathon** | Verified tests, synthetic datasets, complete documentation, and demo UI | **Current** |
| **Q1 2027** | **Phase 5.1 Ingestion** | Redis Streams async queue + Hotelbeds / Expedia partner connectors | Planned |
| **Q2 2027** | **Phase 5.2 Vector AI** | pgvector integration + hybrid semantic embeddings | Planned |
| **Q3 2027** | **Phase 5.3 SaaS Beta** | Multi-tenant SaaS release with self-service API subscriptions | Planned |

---

## 4. Related Documentation Links

- [Product Requirements Document](PRD.md)
- [System Architecture](ARCHITECTURE.md)
- [AI Intelligence Engine](AI_ENGINE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
