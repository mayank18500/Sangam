# API Documentation — SANGAM

**Base Backend URL:** `http://localhost:4000/api/v1`  
**Base Intelligence URL:** `http://localhost:8000`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new user account.
- **Body:**
  ```json
  {
    "email": "analyst@sangam.travel",
    "password": "SecurePassword123!",
    "name": "Priya Sen",
    "role": "ANALYST"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "...", "email": "analyst@sangam.travel", "name": "Priya Sen", "role": "ANALYST" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates user and returns JWT bearer token.
- **Body:**
  ```json
  {
    "email": "admin@sangam.travel",
    "password": "Admin@123456"
  }
  ```

### `GET /api/v1/auth/me`
Returns authenticated user profile. (Requires `Authorization: Bearer <token>`).

---

## 2. Supplier Endpoints

### `GET /api/v1/suppliers`
Lists all registered suppliers, reliability scores, and count of active listings.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8df07285-4c10-...",
        "code": "SUP-BOOKINGBRIDGE",
        "name": "BookingBridge Global",
        "reliabilityScore": "0.94",
        "status": "ACTIVE",
        "totalListings": 4,
        "totalImports": 1
      }
    ]
  }
  ```

### `POST /api/v1/suppliers`
Registers a new supplier feed. (Requires `Authorization: Bearer <token>`).
- **Body:**
  ```json
  {
    "code": "SUP-AGODA",
    "name": "Agoda Direct Connect",
    "contactEmail": "api@agoda.com",
    "apiEndpoint": "https://api.agoda.com/v2/rates",
    "reliabilityScore": 0.92
  }
  ```

---

## 3. Inventory Endpoints

### `GET /api/v1/inventory`
Queries raw inbound supplier listings.
- **Query Params:**
  - `category`: `HOTEL` | `SIGHTSEEING`
  - `supplierId`: UUID
  - `matchStatus`: `UNMATCHED` | `AUTO_MATCHED` | `MANUALLY_MATCHED` | `REVIEW_REQUIRED` | `REJECTED`
  - `search`: Keyword string
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 20)

### `GET /api/v1/inventory/:id`
Returns raw listing payload and linked canonical entity if matched.

---

## 4. Canonical Entities Endpoints

### `GET /api/v1/entities`
Lists consolidated master products with counts of linked supplier feeds.
- **Query Params:** `category`, `city`, `search`, `page`, `limit`

### `GET /api/v1/entities/:id`
Returns full canonical profile including all consolidated supplier listings, variants, and offers.

---

## 5. Matching & Intelligence Endpoints

### `GET /api/v1/matching/pending`
Returns all supplier listings awaiting human-in-the-loop review.

### `POST /api/v1/matching/decision`
Applies an analyst decision and records an immutable audit log.
- **Body:**
  ```json
  {
    "sourceListingId": "9b1deb4d-...",
    "targetCanonicalId": "4a2b9f3e-...",
    "decision": "MANUAL_CONFIRM",
    "explanation": { "reason": "Verified via coordinates and street address" }
  }
  ```

### `POST /api/v1/matching/run`
Triggers the Python intelligence matching engine for a specific listing.

---

## 6. Offer Comparison & Ranking Endpoints

### `GET /api/v1/offers/compare?canonicalEntityId=<uuid>`
Returns multi-supplier comparison matrix for all offers linked to a canonical entity.

### `POST /api/v1/offers/rank`
Runs multi-criteria offer ranking algorithm and updates database.
- **Body:**
  ```json
  {
    "canonicalEntityId": "4a2b9f3e-...",
    "priceWeight": 0.40,
    "reliabilityWeight": 0.25,
    "cancellationWeight": 0.20,
    "inclusionsWeight": 0.15
  }
  ```

---

## 7. Python Intelligence Microservice Direct Endpoints

### `GET http://localhost:8000/health`
Checks FastAPI health status and capabilities.

### `POST http://localhost:8000/match/entities`
Decomposed fuzzy token & Haversine distance scoring.

### `POST http://localhost:8000/rank/offers`
Multi-criteria offer evaluation engine.
