# Data Dictionary & Field Reference — SANGAM

**Product Name:** Sangam  
**Tagline:** Where Travel Inventory Comes Together  
**Document Version:** 1.1.0  
**Status:** Canonical Data Specification  
**Last Updated:** November 2026  
**Related Documents:** [DATABASE.md](DATABASE.md) • [API.md](API.md) • [AI_ENGINE.md](AI_ENGINE.md)

---

## 1. Overview & Data Conventions

This document provides a single reference catalog for every field across the Sangam platform, including PostgreSQL column types, API JSON formats, units of measurement, validation constraints, and enumerated values.

### Standard Conventions:
- **Primary Identifiers:** All primary keys (`id`) are standard RFC 4122 Version 4 UUID strings (e.g., `4a2b9f3e-8219-4a0b-932b-9c293b610192`).
- **Timestamps:** ISO 8601 UTC formatted strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Monetary Amounts:** High-precision decimals stored as `DECIMAL(10,2)` in PostgreSQL and serialized as float/decimal in JSON. Currencies follow ISO 4217 standard alpha-3 codes (default: `USD`).
- **Geographic Coordinates:** Stored as `DECIMAL(10,6)` in standard WGS 84 format (Latitude: $-90.0 \dots +90.0$, Longitude: $-180.0 \dots +180.0$).
- **Normalized Scores:** Stored as `DECIMAL(5,4)` bounded within the closed interval $[0.0000, 1.0000]$.

---

## 2. Supplier Data Entities

### 2.1 Supplier Model (`suppliers`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Internal primary key. |
| `code` | String | `TEXT` | No | Unique, $2 \dots 50$ chars, uppercase prefix `SUP-` | Business identifier code (e.g., `SUP-BOOKINGBRIDGE`). |
| `name` | String | `TEXT` | No | Min $2$ chars | Legal or commercial entity name of supplier. |
| `contactEmail` | String | `TEXT` | Yes | Valid RFC 5322 email | Primary technical or operational contact email. |
| `status` | Enum | `SupplierStatus` | No | Default `ACTIVE` | Operational state: `ACTIVE`, `INACTIVE`, `SUSPENDED`. |
| `reliabilityScore` | Decimal | `DECIMAL(5,2)` | No | Default `1.00`, Range: $[0.00, 1.00]$ | Historical booking fulfillment success rate. |
| `apiEndpoint` | String | `TEXT` | Yes | Valid URL | Ingestion feed endpoint URL. |
| `metadata` | JSON | `JSONB` | No | Default `{}` | Flexible connectivity flags, refresh schedules, protocol. |

### 2.2 Inventory Import Model (`inventory_imports`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Batch import job identifier. |
| `supplierId` | UUID | `TEXT` | No | FK $\to$ `suppliers.id` | Providing supplier. |
| `importRef` | String | `TEXT` | No | Unique, Min $3$ chars | External batch identifier (e.g., `IMP-HTL-202611-001`). |
| `category` | Enum | `InventoryCategory` | No | `HOTEL` or `SIGHTSEEING` | Vertical discriminator. |
| `status` | Enum | `ImportStatus` | No | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` | Pipeline execution status. |
| `totalRecords` | Integer | `INTEGER` | No | Min $0$, Default $0$ | Total inventory items declared in batch. |
| `processedRecords`| Integer | `INTEGER` | No | Min $0$, Default $0$ | Number of records successfully parsed and upserted. |
| `errorLog` | JSON | `JSONB` | No | Default `[]` | Array of parser errors or warning payloads. |

---

## 3. Inventory & Product Entities

### 3.1 Canonical Entity Model (`canonical_entities`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Master canonical product identifier. |
| `category` | Enum | `InventoryCategory` | No | `HOTEL` or `SIGHTSEEING` | Inventory vertical. |
| `name` | String | `TEXT` | No | Min $2$ chars | Master verified product title. |
| `standardizedName`| String | `TEXT` | No | Lowercase, noise-stripped | Index scanning string (e.g., `oberoi grand kolkata`). |
| `destinationCity` | String | `TEXT` | No | Standardized name | Normalized city (e.g., `Kolkata`). |
| `destinationCountry`| String | `TEXT` | No | Standardized name | Normalized country (e.g., `India`). |
| `latitude` | Decimal | `DECIMAL(10,6)` | Yes | Range: $[-90.0, 90.0]$ | Verified GPS latitude coordinates. |
| `longitude` | Decimal | `DECIMAL(10,6)` | Yes | Range: $[-180.0, 180.0]$ | Verified GPS longitude coordinates. |
| `starRating` | Decimal | `DECIMAL(3,1)` | Yes | Range: $[1.0, 5.0]$ | Official government/accreditation star rating. |
| `address` | String | `TEXT` | Yes | Freeform string | Normalized master street address. |
| `description` | Text | `TEXT` | Yes | Markdown / Plaintext | Consolidated synthesized description. |
| `attributes` | JSON | `JSONB` | No | Default `{}` | Flexible vertical-specific key-value pairs (see below). |
| `status` | Enum | `CanonicalStatus` | No | Default `ACTIVE` | `ACTIVE`, `DRAFT`, `MERGED`, `ARCHIVED`. |

#### Canonical Attributes JSONB Schema:
- **Hotels:** `{ pool: boolean, spa: boolean, fitnessCenter: boolean, restaurantsCount: integer, heritageYear: integer }`
- **Sightseeing:** `{ estimatedDurationHours: float, accessType: string, wheelchairAccessible: boolean, transfersAvailable: boolean }`

---

### 3.2 Supplier Listing Model (`supplier_listings`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Unique listing identifier. |
| `supplierId` | UUID | `TEXT` | No | FK $\to$ `suppliers.id` | Source supplier. |
| `canonicalEntityId`| UUID | `TEXT` | Yes | FK $\to$ `canonical_entities.id` | Linked canonical master (null if unconfirmed). |
| `externalId` | String | `TEXT` | No | Unique per supplier | Supplier's native product ID (e.g., `BB-HTL-77401`). |
| `category` | Enum | `InventoryCategory` | No | `HOTEL` or `SIGHTSEEING` | Vertical classification. |
| `rawName` | String | `TEXT` | No | Unmodified supplier string | Raw listing name as received in feed. |
| `normalizedName` | String | `TEXT` | No | Lowercase, noise-stripped | Tokens used for candidate blocking and matching. |
| `rawAddress` | String | `TEXT` | Yes | Unmodified string | Supplier's raw street address text. |
| `city` / `country`| String | `TEXT` | Yes | Unmodified string | Location as declared by supplier. |
| `rawData` | JSON | `JSONB` | No | Default `{}` | Complete unaltered inbound JSON payload from feed. |
| `matchStatus` | Enum | `MatchStatus` | No | Default `UNMATCHED` | `UNMATCHED`, `AUTO_MATCHED`, `MANUALLY_MATCHED`, `REVIEW_REQUIRED`, `REJECTED`. |
| `matchConfidence`| Decimal | `DECIMAL(5,4)` | Yes | Range: $[0.0000, 1.0000]$ | Algorithmic matching confidence score. |

---

## 4. Product Variants & Bookable Offers

### 4.1 Canonical Variant Model (`canonical_variants`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Unique variant identifier. |
| `canonicalEntityId`| UUID | `TEXT` | No | FK $\to$ `canonical_entities.id` | Parent canonical entity. |
| `category` | Enum | `InventoryCategory` | No | `HOTEL` or `SIGHTSEEING` | Vertical. |
| `name` | String | `TEXT` | No | e.g. "Deluxe King Room" | Standardized variant name. |
| `standardCode` | String | `TEXT` | Yes | e.g. `DLX-KNG-COURTYARD` | Standardized internal code. |
| `attributes` | JSON | `JSONB` | No | Default `{}` | Bed configuration, max occupancy, room size ($m^2$). |

### 4.2 Supplier Variant Listing Model (`supplier_variant_listings`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Unique supplier variant ID. |
| `supplierListingId`| UUID | `TEXT` | No | FK $\to$ `supplier_listings.id` | Parent supplier listing. |
| `canonicalVariantId`| UUID | `TEXT` | Yes | FK $\to$ `canonical_variants.id` | Linked canonical variant. |
| `externalVariantId`| String | `TEXT` | No | Unique per listing | Supplier's native room code. |
| `rawName` | String | `TEXT` | No | Raw supplier room title | e.g. "Deluxe Room, 1 King Bed". |

### 4.3 Offer Model (`offers`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Unique offer commercial rate ID. |
| `supplierVariantListingId`| UUID | `TEXT` | No | FK $\to$ `supplier_variant_listings.id` | Linked variant listing. |
| `currency` | String | `TEXT` | No | ISO 4217 (Default `USD`) | Currency of rate amounts. |
| `basePrice` | Decimal | `DECIMAL(10,2)` | No | Min $0.00$ | Public retail / gross rate. |
| `netPrice` | Decimal | `DECIMAL(10,2)` | No | Min $0.00$ | Wholesaler B2B buy rate. |
| `taxAmount` | Decimal | `DECIMAL(10,2)` | No | Default $0.00$ | Mandatory taxes, resort fees, city fees. |
| `availabilityCount`| Integer | `INTEGER` | Yes | Default $1$ | Available allotment units. |
| `checkInDate` / `checkOutDate` | DateTime | `TIMESTAMP(3)` | Yes | Valid dates | Stay duration (Hotels). |
| `cancellationPolicy`| JSON | `JSONB` | No | Default `{}` | `{ refundable: bool, deadline_hours: int, penalty: float }`. |
| `mealPlan` | String | `TEXT` | Yes | e.g. "Bed & Breakfast" | Inbound catering provision. |
| `transferIncluded` | Boolean | `BOOLEAN` | No | Default `false` | Airport or port transfer inclusion flag. |
| `inclusions` | JSON | `JSONB` | No | Default `[]` | Array of included perks (e.g. `["Wi-Fi", "Breakfast"]`). |

---

## 5. Intelligence, Governance & Audit Entities

### 5.1 Match Decision Model (`match_decisions`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Audit record identifier. |
| `entityType` | Enum | `DecisionEntityType`| No | `ENTITY` or `VARIANT` | Targeted level of inventory hierarchy. |
| `sourceListingId` | UUID | `TEXT` | No | Source record UUID | Inbound supplier record. |
| `targetCanonicalId`| UUID | `TEXT` | No | Target master UUID | Master canonical product linked or created. |
| `decision` | Enum | `DecisionType` | No | `AUTO_ACCEPT`, `MANUAL_CONFIRM`, `MANUAL_REJECT`, `SPLIT` | Applied decision. |
| `confidenceScore` | Decimal | `DECIMAL(5,4)` | No | Range: $[0.0000, 1.0000]$ | Overall score at time of decision. |
| `explanation` | JSON | `JSONB` | No | Default `{}` | Full score component breakdown and analyst notes. |
| `decidedByUserId` | UUID | `TEXT` | Yes | FK $\to$ `users.id` | Reviewer user ID (null for automated decisions). |
| `decidedAt` | DateTime | `TIMESTAMP(3)` | No | Default `now()` | Exact audit timestamp. |

### 5.2 Ranking Result Model (`ranking_results`)
| Field Name | Type | Storage Format | Nullable | Validation / Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | `TEXT` | No | RFC 4122 UUID v4 | Ranking computation ID. |
| `offerId` | UUID | `TEXT` | No | FK $\to$ `offers.id` | Target commercial offer. |
| `rankPosition` | Integer | `INTEGER` | No | Min $1$ | Final ordinal rank ($1 = \text{best option}$). |
| `overallScore` | Decimal | `DECIMAL(5,4)` | No | Range: $[0.0000, 1.0000]$ | Weighted overall offer score. |
| `priceScore` | Decimal | `DECIMAL(5,4)` | No | Range: $[0.2000, 1.0000]$ | Dynamic price competitiveness score. |
| `reliabilityScore`| Decimal | `DECIMAL(5,4)` | No | Range: $[0.0000, 1.0000]$ | Supplier historical fulfillment rating. |
| `cancellationScore`| Decimal | `DECIMAL(5,4)` | No | Range: $[0.2000, 1.0000]$ | Refundability and deadline score. |
| `scoreBreakdown` | JSON | `JSONB` | No | Default `{}` | Human-readable justification explanation. |

---

## 6. Related Documentation Links

- [Database Design Reference](DATABASE.md)
- [API Reference](API.md)
- [AI Intelligence Engine](AI_ENGINE.md)

