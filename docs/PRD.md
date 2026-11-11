# Product Requirements Document (PRD) — SANGAM

**Product Name:** Sangam  
**Tagline:** Where Travel Inventory Comes Together  
**Document Version:** 1.0.0 (Foundational Architecture)  
**Status:** In Active Development (Hackathon & Commercial SaaS Target)

---

## 1. Executive Summary

B2B travel aggregators, Online Travel Agencies (OTAs), and Destination Management Companies (DMCs) ingest millions of travel inventory items across dozens of external bedbanks, global distribution systems (GDS), and local activity aggregators.

Due to lack of universal industry identifiers, identical properties and tours are represented differently across suppliers:
- **Differing Property Names:** "The Oberoi Grand Kolkata" vs "Oberoi Grand Hotel".
- **Discrepant Room Types:** "Deluxe King Heritage" vs "Deluxe Room, 1 King Bed".
- **Divergent Inclusions:** Rates with complimentary airport transfers or breakfast vs room-only rates.
- **Varying Cancellation Conditions:** 24h flexible cancellation vs 100% non-refundable fees.

**Sangam** solves this fragmentation through an explainable, multi-vertical inventory intelligence engine that:
1. Consolidates multi-supplier hotel and sightseeing inventory into verified canonical entities without destructive data loss.
2. Identifies duplicate products using fuzzy token matching, coordinate proximity, and attribute scoring.
3. Preserves supplier-specific original IDs, descriptions, and booking conditions.
4. Normalizes room categories and ticket tiers.
5. Intelligently ranks offers across price, supplier fulfillment reliability, cancellation flexibility, and value of inclusions.

---

## 2. Target Personas

### 2.1 Inventory Analysts & Operations Specialists
- **Need:** Review borderline duplicate candidates and resolve false-positive matches through an intuitive side-by-side interface.
- **Pain Point:** Manual Excel reconciliation takes days and causes booking errors or duplicate supplier payouts.

### 2.2 Commercial Product Managers & Contracting Leads
- **Need:** Compare multi-supplier offer matrices in real-time to negotiate competitive net rates with underperforming bedbanks.
- **Pain Point:** Lack of visibility into which supplier provides the best net rates and cancellation terms for identical rooms.

### 2.3 Software Engineers & Integrations Team
- **Need:** Modular APIs with explainable confidence scoring, clear schema separation, and non-destructive database mutations.

---

## 3. Product Scope & Functional Requirements

### Vertical 1: Hotels
- **Property Deduplication:** Multi-signal matching (RapidFuzz token sets, Haversine geo-distance, star rating delta, normalized addresses).
- **Room Category Matching:** Normalization of bed configurations, view types, and standard codes.
- **Property Content Normalization:** Canonical master profiles with consolidated imagery and amenities.
- **Price & Availability Comparison:** Side-by-side net and gross rate matrices.
- **Cancellation & Payment Policy Comparison:** Refundability status, penalty windows, and deadlines.
- **Supplier Reliability:** Dynamic weighting of historical fulfillment and error rates.
- **Offer Ranking:** Multi-criteria weighted scoring engine.

### Vertical 2: Sightseeing & Activities
- **Attraction Deduplication:** Historical monuments, theme parks, and activity locations.
- **Tour Matching:** Group tours vs private tours, duration comparison (hours/days).
- **Inclusions / Exclusions:** Hotel pickup/drop, audio guides, forest permits, meal inclusions.
- **Access Types:** Skip-the-line tickets vs standard museum entry.
- **Cancellation Comparison:** Activity weather cancellation provisions and penalty terms.

---

## 4. Key Performance Indicators (KPIs)

- **Deduplication Precision:** > 98% precision on automated match gates (confidence score >= 0.85).
- **Consolidation Ratio:** Target 2.5:1 to 4:1 duplicate compression across suppliers.
- **Explainability:** 100% of matching decisions backed by decomposed metric contributions.
- **Data Preservation:** Zero overwrite of raw supplier payloads (stored via JSONB).

---

## 5. Non-Functional Requirements

- **Strict Auditability:** All manual confirm/reject/split decisions logged with reviewer ID and timestamp.
- **Separation of Concerns:** Independent Python intelligence engine decoupled from transactional Express backend.
- **Extensibility:** Schema designed for zero-schema-change expansion into Flights, Rail, and Car Rentals.
