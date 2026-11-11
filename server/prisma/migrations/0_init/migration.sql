-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('HOTEL', 'SIGHTSEEING');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('UNMATCHED', 'AUTO_MATCHED', 'MANUALLY_MATCHED', 'REVIEW_REQUIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CanonicalStatus" AS ENUM ('ACTIVE', 'DRAFT', 'MERGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('AUTO_ACCEPT', 'MANUAL_CONFIRM', 'MANUAL_REJECT', 'SPLIT');

-- CreateEnum
CREATE TYPE "DecisionEntityType" AS ENUM ('ENTITY', 'VARIANT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ANALYST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "reliabilityScore" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "apiEndpoint" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_imports" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "importRef" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "errorLog" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "inventory_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canonical_entities" (
    "id" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "standardizedName" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "starRating" DECIMAL(3,1),
    "address" TEXT,
    "description" TEXT,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "status" "CanonicalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canonical_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_listings" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "importId" TEXT,
    "canonicalEntityId" TEXT,
    "externalId" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "rawName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "rawAddress" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "starRating" DECIMAL(3,1),
    "rawDescription" TEXT,
    "rawData" JSONB NOT NULL DEFAULT '{}',
    "matchStatus" "MatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchConfidence" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canonical_variants" (
    "id" TEXT NOT NULL,
    "canonicalEntityId" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "standardCode" TEXT,
    "description" TEXT,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canonical_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_variant_listings" (
    "id" TEXT NOT NULL,
    "supplierListingId" TEXT NOT NULL,
    "canonicalVariantId" TEXT,
    "externalVariantId" TEXT NOT NULL,
    "rawName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "rawDescription" TEXT,
    "rawData" JSONB NOT NULL DEFAULT '{}',
    "matchStatus" "MatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchConfidence" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_variant_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "supplierVariantListingId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "netPrice" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "availabilityCount" INTEGER DEFAULT 1,
    "checkInDate" TIMESTAMP(3),
    "checkOutDate" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "cancellationPolicy" JSONB NOT NULL DEFAULT '{}',
    "mealPlan" TEXT,
    "transferIncluded" BOOLEAN NOT NULL DEFAULT false,
    "inclusions" JSONB NOT NULL DEFAULT '[]',
    "bookingConditions" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_decisions" (
    "id" TEXT NOT NULL,
    "entityType" "DecisionEntityType" NOT NULL,
    "sourceListingId" TEXT NOT NULL,
    "targetCanonicalId" TEXT NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "confidenceScore" DECIMAL(5,4) NOT NULL,
    "explanation" JSONB NOT NULL DEFAULT '{}',
    "decidedByUserId" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_results" (
    "id" TEXT NOT NULL,
    "queryContext" JSONB NOT NULL DEFAULT '{}',
    "offerId" TEXT NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "overallScore" DECIMAL(5,4) NOT NULL,
    "priceScore" DECIMAL(5,4) NOT NULL,
    "reliabilityScore" DECIMAL(5,4) NOT NULL,
    "cancellationScore" DECIMAL(5,4) NOT NULL,
    "scoreBreakdown" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "suppliers_code_idx" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_imports_importRef_key" ON "inventory_imports"("importRef");

-- CreateIndex
CREATE INDEX "inventory_imports_supplierId_idx" ON "inventory_imports"("supplierId");

-- CreateIndex
CREATE INDEX "inventory_imports_status_idx" ON "inventory_imports"("status");

-- CreateIndex
CREATE INDEX "inventory_imports_category_idx" ON "inventory_imports"("category");

-- CreateIndex
CREATE INDEX "canonical_entities_category_idx" ON "canonical_entities"("category");

-- CreateIndex
CREATE INDEX "canonical_entities_destinationCity_idx" ON "canonical_entities"("destinationCity");

-- CreateIndex
CREATE INDEX "canonical_entities_destinationCountry_idx" ON "canonical_entities"("destinationCountry");

-- CreateIndex
CREATE INDEX "canonical_entities_standardizedName_idx" ON "canonical_entities"("standardizedName");

-- CreateIndex
CREATE INDEX "supplier_listings_supplierId_idx" ON "supplier_listings"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_listings_canonicalEntityId_idx" ON "supplier_listings"("canonicalEntityId");

-- CreateIndex
CREATE INDEX "supplier_listings_category_idx" ON "supplier_listings"("category");

-- CreateIndex
CREATE INDEX "supplier_listings_matchStatus_idx" ON "supplier_listings"("matchStatus");

-- CreateIndex
CREATE INDEX "supplier_listings_normalizedName_idx" ON "supplier_listings"("normalizedName");

-- CreateIndex
CREATE INDEX "supplier_listings_city_idx" ON "supplier_listings"("city");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_listings_supplierId_externalId_key" ON "supplier_listings"("supplierId", "externalId");

-- CreateIndex
CREATE INDEX "canonical_variants_canonicalEntityId_idx" ON "canonical_variants"("canonicalEntityId");

-- CreateIndex
CREATE INDEX "canonical_variants_category_idx" ON "canonical_variants"("category");

-- CreateIndex
CREATE INDEX "canonical_variants_name_idx" ON "canonical_variants"("name");

-- CreateIndex
CREATE INDEX "supplier_variant_listings_supplierListingId_idx" ON "supplier_variant_listings"("supplierListingId");

-- CreateIndex
CREATE INDEX "supplier_variant_listings_canonicalVariantId_idx" ON "supplier_variant_listings"("canonicalVariantId");

-- CreateIndex
CREATE INDEX "supplier_variant_listings_matchStatus_idx" ON "supplier_variant_listings"("matchStatus");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_variant_listings_supplierListingId_externalVariant_key" ON "supplier_variant_listings"("supplierListingId", "externalVariantId");

-- CreateIndex
CREATE INDEX "offers_supplierVariantListingId_idx" ON "offers"("supplierVariantListingId");

-- CreateIndex
CREATE INDEX "offers_netPrice_idx" ON "offers"("netPrice");

-- CreateIndex
CREATE INDEX "offers_currency_idx" ON "offers"("currency");

-- CreateIndex
CREATE INDEX "match_decisions_sourceListingId_idx" ON "match_decisions"("sourceListingId");

-- CreateIndex
CREATE INDEX "match_decisions_targetCanonicalId_idx" ON "match_decisions"("targetCanonicalId");

-- CreateIndex
CREATE INDEX "match_decisions_decision_idx" ON "match_decisions"("decision");

-- CreateIndex
CREATE INDEX "match_decisions_decidedAt_idx" ON "match_decisions"("decidedAt");

-- CreateIndex
CREATE INDEX "ranking_results_offerId_idx" ON "ranking_results"("offerId");

-- CreateIndex
CREATE INDEX "ranking_results_rankPosition_idx" ON "ranking_results"("rankPosition");

-- CreateIndex
CREATE INDEX "ranking_results_overallScore_idx" ON "ranking_results"("overallScore");

-- AddForeignKey
ALTER TABLE "inventory_imports" ADD CONSTRAINT "inventory_imports_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_listings" ADD CONSTRAINT "supplier_listings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_listings" ADD CONSTRAINT "supplier_listings_importId_fkey" FOREIGN KEY ("importId") REFERENCES "inventory_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_listings" ADD CONSTRAINT "supplier_listings_canonicalEntityId_fkey" FOREIGN KEY ("canonicalEntityId") REFERENCES "canonical_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canonical_variants" ADD CONSTRAINT "canonical_variants_canonicalEntityId_fkey" FOREIGN KEY ("canonicalEntityId") REFERENCES "canonical_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_variant_listings" ADD CONSTRAINT "supplier_variant_listings_supplierListingId_fkey" FOREIGN KEY ("supplierListingId") REFERENCES "supplier_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_variant_listings" ADD CONSTRAINT "supplier_variant_listings_canonicalVariantId_fkey" FOREIGN KEY ("canonicalVariantId") REFERENCES "canonical_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_supplierVariantListingId_fkey" FOREIGN KEY ("supplierVariantListingId") REFERENCES "supplier_variant_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_decisions" ADD CONSTRAINT "match_decisions_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_results" ADD CONSTRAINT "ranking_results_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

