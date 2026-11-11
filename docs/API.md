# API Reference Documentation — SANGAM

**Product Name:** Sangam  
**Tagline:** Where Travel Inventory Comes Together  
**Document Version:** 1.1.0  
**Base Backend URL:** `http://localhost:4000/api/v1`  
**Base Intelligence URL:** `http://127.0.0.1:8000`  
**Last Updated:** November 2026  
**Related Documents:** [ARCHITECTURE.md](ARCHITECTURE.md) • [DATABASE.md](DATABASE.md) • [AI_ENGINE.md](AI_ENGINE.md)

---

## 1. Authentication & Security Conventions

### 1.1 Bearer Token Header
Protected endpoints require an `Authorization` header containing a valid signed JWT:
```http
Authorization: Bearer <JWT_TOKEN>
```
Unauthenticated requests to protected routes return `401 Unauthorized`.

### 1.2 Standard Response Structure
All Express API endpoints follow a consistent JSON envelope:
```json
{
  "success": true,
  "message": "Optional human-readable confirmation",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### 1.3 Standard Error Response Structure
Validation and runtime errors return structured diagnostics:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 2. Express Backend API (`/api/v1`)

### 2.1 System & Health

#### `GET /api/v1/health`
- **Purpose:** Verifies operational readiness of Express server and underlying PostgreSQL database connection.
- **Auth Required:** None.
- **Example Request:**
  ```bash
  curl -X GET http://localhost:4000/api/v1/health
  ```
- **Example Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-11T08:20:34.779Z",
    "service": "Sangam Express API Backend",
    "version": "0.1.0",
    "environment": "development",
    "database": "connected"
  }
  ```

---

### 2.2 Authentication Module

#### `POST /api/v1/auth/register`
- **Purpose:** Provisions a new platform user account.
- **Auth Required:** None.
- **Validation Rules (Zod):**
  - `email`: Valid email format, unique in database.
  - `password`: String, minimum $6$ characters.
  - `name`: String, minimum $2$ characters.
  - `role`: Optional enum (`ADMIN`, `ANALYST`, `VIEWER`), defaults to `ANALYST`.
- **Example Request:**
  ```bash
  curl -X POST http://localhost:4000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "priya.sen@sangam.travel",
      "password": "SecurePassword123!",
      "name": "Priya Sen",
      "role": "ANALYST"
    }'
  ```
- **Example Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "e931dc12-4f32-47e2-a0b7-1c4b8b601614",
        "email": "priya.sen@sangam.travel",
        "name": "Priya Sen",
        "role": "ANALYST",
        "createdAt": "2026-11-11T08:30:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure on email or password length.
  - `409 Conflict`: Email already registered.

#### `POST /api/v1/auth/login`
- **Purpose:** Authenticates user via bcrypt verification and issues a stateless 7-day JWT.
- **Auth Required:** None.
- **Validation Rules (Zod):**
  - `email`: Valid email format.
  - `password`: String, minimum $1$ character.
- **Example Request:**
  ```bash
  curl -X POST http://localhost:4000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@sangam.travel",
      "password": "Admin@123456"
    }'
  ```
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "84a7e932-8419-4a0b-932b-9c293b610192",
        "email": "admin@sangam.travel",
        "name": "Aditi Sharma (Admin)",
        "role": "ADMIN"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid email or password.

#### `GET /api/v1/auth/me`
- **Purpose:** Retrieves identity and role profile of currently signed-in user.
- **Auth Required:** Yes (`Bearer <token>`).
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "84a7e932-8419-4a0b-932b-9c293b610192",
      "email": "admin@sangam.travel",
      "name": "Aditi Sharma (Admin)",
      "role": "ADMIN",
      "createdAt": "2026-11-11T08:00:00.000Z"
    }
  }
  ```

---

### 2.3 Suppliers Module

#### `GET /api/v1/suppliers`
- **Purpose:** Lists all registered travel suppliers with aggregate counts of active listings and imports.
- **Auth Required:** None.
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8df07285-4c10-4768-92bc-a2da462ea165",
        "code": "SUP-BOOKINGBRIDGE",
        "name": "BookingBridge Global",
        "contactEmail": "api@bookingbridge.net",
        "status": "ACTIVE",
        "reliabilityScore": "0.94",
        "apiEndpoint": "https://api.bookingbridge.net/v2/inventory",
        "metadata": { "connectionType": "REST/JSON" },
        "createdAt": "2026-11-11T08:00:00.000Z",
        "totalListings": 4,
        "totalImports": 1
      }
    ]
  }
  ```

#### `POST /api/v1/suppliers`
- **Purpose:** Registers a new supplier connection.
- **Auth Required:** Yes (`Bearer <token>`).
- **Validation Rules (Zod):**
  - `code`: String, $2 \dots 50$ characters, unique.
  - `name`: String, minimum $2$ characters.
  - `contactEmail`: Optional valid email.
  - `apiEndpoint`: Optional valid URL.
  - `reliabilityScore`: Optional float ($0.0 \dots 1.0$), defaults to $0.85$.
  - `metadata`: Optional JSON object.
- **Example Request:**
  ```bash
  curl -X POST http://localhost:4000/api/v1/suppliers \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "code": "SUP-AGODADIRECT",
      "name": "Agoda Direct Connect",
      "contactEmail": "partner@agoda.com",
      "apiEndpoint": "https://api.agoda.com/v1/rates",
      "reliabilityScore": 0.91
    }'
  ```

#### `GET /api/v1/suppliers/:id`
- **Purpose:** Fetches single supplier details including 5 most recent inventory imports.
- **Path Parameters:** `id` (UUID).

---

### 2.4 Inventory Imports Module

#### `GET /api/v1/imports`
- **Purpose:** Lists batch ingestion logs.
- **Query Parameters:**
  - `category` (optional): `HOTEL` | `SIGHTSEEING`.
  - `status` (optional): `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`.
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "18f912da-4b82-4112-9c32-1b91823901a8",
        "supplierId": "8df07285-4c10-...",
        "importRef": "IMP-HTL-202611-001",
        "category": "HOTEL",
        "status": "COMPLETED",
        "totalRecords": 120,
        "processedRecords": 120,
        "startedAt": "2026-11-11T06:00:00.000Z",
        "completedAt": "2026-11-11T06:12:00.000Z",
        "supplier": { "id": "...", "name": "BookingBridge Global", "code": "SUP-BOOKINGBRIDGE" },
        "_count": { "listings": 120 }
      }
    ]
  }
  ```

#### `POST /api/v1/imports`
- **Purpose:** Initiates a new inventory batch import job.
- **Auth Required:** Yes.
- **Validation Rules (Zod):** `supplierId` (UUID), `importRef` (string, min 3), `category` (`HOTEL` | `SIGHTSEEING`), `totalRecords` (int $\ge 0$).

---

### 2.5 Inventory Explorer Module

#### `GET /api/v1/inventory`
- **Purpose:** Queries raw supplier inventory listings with filtering and pagination.
- **Query Parameters:**
  - `category` (optional): `HOTEL` | `SIGHTSEEING`.
  - `supplierId` (optional): Filter by supplier UUID.
  - `matchStatus` (optional): `UNMATCHED`, `AUTO_MATCHED`, `MANUALLY_MATCHED`, `REVIEW_REQUIRED`, `REJECTED`.
  - `search` (optional): Case-insensitive keyword search on `rawName`, `city`, or `externalId`.
  - `page` (optional): Page number (default: $1$).
  - `limit` (optional): Records per page ($1 \dots 100$, default: $20$).
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "9b1deb4d-3b7d-4b92-9b21-4a2b9f3e0123",
        "supplierId": "8df07285-4c10-...",
        "externalId": "BB-HTL-77401",
        "category": "HOTEL",
        "rawName": "The Oberoi Grand Kolkata",
        "normalizedName": "oberoi grand kolkata",
        "city": "Kolkata",
        "country": "India",
        "matchStatus": "AUTO_MATCHED",
        "matchConfidence": "0.9850",
        "supplier": { "name": "BookingBridge Global", "code": "SUP-BOOKINGBRIDGE" },
        "canonicalEntity": { "id": "4a2b9f3e-...", "name": "The Oberoi Grand Kolkata" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 11,
      "totalPages": 1
    }
  }
  ```

#### `GET /api/v1/inventory/:id`
- **Purpose:** Retrieves single supplier listing including full `rawData` JSONB payload, linked canonical entity, variants, and offers.

---

### 2.6 Canonical Entities Module

#### `GET /api/v1/entities`
- **Purpose:** Queries consolidated master products with aggregate supplier counts.
- **Query Parameters:** `category`, `city`, `search`, `page`, `limit`.

#### `GET /api/v1/entities/:id`
- **Purpose:** Fetches single master product with all consolidated supplier listings, room variants, offers, and ranking results.

---

### 2.7 Matching & Review Module

#### `GET /api/v1/matching/pending`
- **Purpose:** Fetches all supplier listings quarantined in `REVIEW_REQUIRED` or `UNMATCHED` status.
- **Auth Required:** None.

#### `POST /api/v1/matching/decision`
- **Purpose:** Records an analyst decision to confirm, reject, or split an unconfirmed candidate.
- **Auth Required:** Yes (`Bearer <token>`).
- **Validation Rules (Zod):**
  - `sourceListingId`: UUID.
  - `targetCanonicalId`: UUID.
  - `decision`: `MANUAL_CONFIRM` | `MANUAL_REJECT` | `SPLIT`.
  - `explanation`: Optional JSON metadata.
- **Example Request:**
  ```bash
  curl -X POST http://localhost:4000/api/v1/matching/decision \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "sourceListingId": "9b1deb4d-3b7d-4b92-9b21-4a2b9f3e0123",
      "targetCanonicalId": "4a2b9f3e-8219-4a0b-932b-9c293b610192",
      "decision": "MANUAL_CONFIRM",
      "explanation": { "reason": "Verified via street address and phone lookup" }
    }'
  ```

#### `POST /api/v1/matching/run`
- **Purpose:** Dispatches an on-demand matching evaluation to the Python Intelligence service for a single supplier listing.
- **Auth Required:** Yes.
- **Validation Rules (Zod):** `sourceListingId` (UUID).

---

### 2.8 Offer Comparison & Ranking Module

#### `GET /api/v1/offers/compare`
- **Purpose:** Returns a normalized multi-supplier offer comparison matrix for a specific canonical entity.
- **Query Parameters:** `canonicalEntityId` (UUID, required).
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "entity": {
        "id": "4a2b9f3e-8219-...",
        "name": "The Oberoi Grand Kolkata",
        "category": "HOTEL",
        "city": "Kolkata"
      },
      "offers": [
        {
          "offerId": "7a1b2c3d-...",
          "variantName": "Deluxe King Heritage Room",
          "supplierVariantName": "Deluxe Room, 1 King Bed",
          "supplierName": "GlobalBedBank B2B",
          "supplierCode": "SUP-GLOBALBEDBANK",
          "supplierReliability": 0.88,
          "netPrice": 122.00,
          "basePrice": 140.00,
          "taxAmount": 18.00,
          "cancellationPolicy": { "refundable": true, "deadline_hours": 24 },
          "mealPlan": "Room Only",
          "transferIncluded": true,
          "inclusions": ["Airport One-Way Transfer"],
          "currentRank": 1,
          "overallScore": 0.892
        }
      ]
    }
  }
  ```

#### `POST /api/v1/offers/rank`
- **Purpose:** Calls Python intelligence ranking engine to re-score all offers under a canonical entity using custom weights and persist results to `ranking_results`.
- **Auth Required:** Yes.
- **Validation Rules (Zod):** `canonicalEntityId` (UUID), `priceWeight` (float $0 \dots 1$), `reliabilityWeight`, `cancellationWeight`, `inclusionsWeight`.

---

### 2.9 Analytics Module

#### `GET /api/v1/analytics/overview`
- **Purpose:** Retrieves real-time platform KPIs, deduplication rates, category breakdowns, and supplier distributions.
- **Auth Required:** None.
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalSuppliers": 6,
        "totalInventoryListings": 11,
        "totalCanonicalEntities": 4,
        "pendingMatchReviews": 2,
        "autoMatchedCount": 9,
        "manuallyMatchedCount": 0,
        "deduplicationRatePercent": 81.8,
        "consolidationRatio": "2.75:1"
      },
      "categoryDistribution": [
        { "category": "Hotels", "key": "HOTEL", "rawListings": 6, "canonicalEntities": 2 },
        { "category": "Sightseeing", "key": "SIGHTSEEING", "rawListings": 5, "canonicalEntities": 2 }
      ],
      "supplierDistribution": [
        { "supplierId": "...", "name": "BookingBridge Global", "code": "SUP-BOOKINGBRIDGE", "listingCount": 4, "reliabilityScore": 0.94 }
      ],
      "recentImports": [ ... ]
    }
  }
  ```

---

## 3. Python FastAPI Intelligence Service (`:8000`)

### 3.1 `GET /health`
- **Purpose:** Service health check and capability declaration.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "service": "Sangam Intelligence Service",
    "version": "0.1.0",
    "timestamp": "2026-11-11T08:20:34.857538",
    "capabilities": [
      "hotel_deduplication",
      "sightseeing_matching",
      "variant_resolution",
      "multi_criteria_ranking"
    ]
  }
  ```

---

### 3.2 `POST /match/entities`
- **Purpose:** Compares a source listing against a candidate pool of canonical entities and outputs decomposed confidence scores.
- **Request Body (Pydantic `EntityMatchRequest`):**
  ```json
  {
    "source": {
      "id": "supp-101",
      "name": "The Oberoi Grand Kolkata",
      "category": "HOTEL",
      "city": "Kolkata",
      "country": "India",
      "latitude": 22.5626,
      "longitude": 88.3510,
      "star_rating": 5.0,
      "address": "15 Jawaharlal Nehru Road"
    },
    "candidates": [
      {
        "id": "canon-001",
        "name": "Oberoi Grand Hotel",
        "category": "HOTEL",
        "destination_city": "Kolkata",
        "destination_country": "India",
        "latitude": 22.5628,
        "longitude": 88.3512,
        "star_rating": 5.0,
        "address": "Jawaharlal Nehru Road"
      }
    ],
    "auto_match_threshold": 0.85,
    "review_threshold": 0.65
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "source_id": "supp-101",
    "source_name": "The Oberoi Grand Kolkata",
    "normalized_name": "oberoi grand kolkata",
    "best_match": {
      "canonical_id": "canon-001",
      "canonical_name": "Oberoi Grand Hotel",
      "overall_confidence": 0.985,
      "match_status": "AUTO_MATCHED",
      "score_breakdown": [
        {
          "metric": "name_similarity",
          "score": 0.98,
          "weight": 0.50,
          "weighted_score": 0.49,
          "explanation": "Normalized 'oberoi grand kolkata' vs 'oberoi grand'."
        },
        {
          "metric": "geo_proximity",
          "score": 1.0,
          "weight": 0.30,
          "weighted_score": 0.30,
          "explanation": "Distance: 0.025 km. Proximity score: 1.00."
        },
        {
          "metric": "star_rating",
          "score": 1.0,
          "weight": 0.10,
          "weighted_score": 0.10,
          "explanation": "Ratings identical or unavailable."
        },
        {
          "metric": "address_similarity",
          "score": 0.95,
          "weight": 0.10,
          "weighted_score": 0.095,
          "explanation": "Address token similarity: 0.95."
        }
      ],
      "reasoning": "High confidence match (0.99 >= 0.85)."
    },
    "ranked_candidates": [ ... ]
  }
  ```

---

### 3.3 `POST /match/variants`
- **Purpose:** Matches room categories or ticket tiers using `fuzz.token_sort_ratio`.
- **Request Body (Pydantic `VariantMatchRequest`):**
  ```json
  {
    "source_variant": {
      "id": "var-src-1",
      "raw_name": "Deluxe Room, 1 King Bed",
      "category": "HOTEL"
    },
    "candidates": [
      {
        "id": "var-canon-1",
        "name": "Deluxe King Heritage Room",
        "category": "HOTEL"
      }
    ]
  }
  ```

---

### 3.4 `POST /rank/offers`
- **Purpose:** Evaluates competing supplier offers across price, reliability, cancellation, and inclusions.
- **Request Body (Pydantic `OfferRankingRequest`):**
  ```json
  {
    "offers": [
      {
        "offer_id": "off-1",
        "supplier_id": "sup-1",
        "supplier_name": "BookingBridge Global",
        "supplier_reliability_score": 0.94,
        "net_price": 130.00,
        "currency": "USD",
        "cancellation_refundable": true,
        "cancellation_deadline_hours": 48,
        "meal_plan": "Bed & Breakfast",
        "transfer_included": false,
        "inclusions_count": 3
      },
      {
        "offer_id": "off-2",
        "supplier_id": "sup-2",
        "supplier_name": "GlobalBedBank B2B",
        "supplier_reliability_score": 0.88,
        "net_price": 122.00,
        "currency": "USD",
        "cancellation_refundable": true,
        "cancellation_deadline_hours": 24,
        "meal_plan": "Room Only",
        "transfer_included": true,
        "inclusions_count": 2
      }
    ],
    "price_weight": 0.40,
    "reliability_weight": 0.25,
    "cancellation_weight": 0.20,
    "inclusions_weight": 0.15
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "total_offers_evaluated": 2,
    "ranked_offers": [
      {
        "rank_position": 1,
        "offer_id": "off-2",
        "overall_score": 0.892,
        "breakdown": {
          "price_score": 1.0,
          "reliability_score": 0.88,
          "cancellation_score": 1.0,
          "inclusions_score": 0.55
        },
        "justification": "Ranked with price $122.00 (1.00), supplier reliability 0.88, cancellation flex 1.00, and inclusions 0.55."
      },
      {
        "rank_position": 2,
        "offer_id": "off-1",
        "overall_score": 0.865,
        "breakdown": {
          "price_score": 0.2,
          "reliability_score": 0.94,
          "cancellation_score": 0.85,
          "inclusions_score": 0.70
        },
        "justification": "Ranked with price $130.00 (0.20), supplier reliability 0.94, cancellation flex 0.85, and inclusions 0.70."
      }
    ]
  }
  ```

---

## 4. Planned & Future Endpoints

| Method | Endpoint | Target Version | Planned Purpose |
|---|---|---|---|
| `POST` | `/api/v1/inventory/stream` | Phase 2 | Streaming ingest endpoint backed by Redis Stream worker. |
| `POST` | `/api/v1/bookings/reserve` | Phase 3 | Dispatches reservation payload directly to winning supplier API. |
| `GET` | `/api/v1/fx/rates` | Phase 2 | Real-time foreign exchange rate conversion. |
| `POST` | `/api/v1/suppliers/:id/sync`| Phase 2 | On-demand trigger to pull remote supplier catalog via webhook. |

---

## 5. Related Documentation Links

- [System Architecture](ARCHITECTURE.md)
- [Database Schema Reference](DATABASE.md)
- [AI Intelligence Engine](AI_ENGINE.md)
- [Development Setup Guide](SETUP.md)
