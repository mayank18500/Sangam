export type InventoryCategory = 'HOTEL' | 'SIGHTSEEING';

export type MatchStatus =
  | 'UNMATCHED'
  | 'AUTO_MATCHED'
  | 'MANUALLY_MATCHED'
  | 'REVIEW_REQUIRED'
  | 'REJECTED';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type ImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactEmail?: string;
  status: SupplierStatus;
  reliabilityScore: number;
  apiEndpoint?: string;
  metadata?: Record<string, any>;
  totalListings?: number;
  totalImports?: number;
  createdAt: string;
}

export interface InventoryImport {
  id: string;
  importRef: string;
  supplierName: string;
  category: InventoryCategory;
  status: ImportStatus;
  totalRecords: number;
  processedRecords?: number;
  startedAt: string;
  completedAt?: string;
}

export interface SupplierListing {
  id: string;
  supplierId: string;
  canonicalEntityId?: string | null;
  externalId: string;
  category: InventoryCategory;
  rawName: string;
  normalizedName: string;
  rawAddress?: string;
  city?: string;
  country?: string;
  starRating?: number;
  rawDescription?: string;
  matchStatus: MatchStatus;
  matchConfidence?: number;
  supplier?: Supplier;
  canonicalEntity?: {
    id: string;
    name: string;
    destinationCity: string;
    status: string;
  };
  createdAt: string;
}

export interface CanonicalEntity {
  id: string;
  category: InventoryCategory;
  name: string;
  standardizedName: string;
  destinationCity: string;
  destinationCountry: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  address?: string;
  description?: string;
  attributes?: Record<string, any>;
  status: string;
  totalSuppliers?: number;
  totalVariants?: number;
  supplierListings?: any[];
  variants?: any[];
  createdAt: string;
}

export interface ComparisonOffer {
  offerId: string;
  variantName: string;
  supplierVariantName: string;
  supplierName: string;
  supplierCode: string;
  supplierReliability: number;
  currency: string;
  netPrice: number;
  basePrice: number;
  taxAmount: number;
  cancellationPolicy: {
    refundable?: boolean;
    deadline_hours?: number;
    penalty?: number;
  };
  mealPlan?: string;
  transferIncluded: boolean;
  inclusions: string[];
  currentRank?: number;
  overallScore?: number;
}

export interface AnalyticsOverview {
  metrics: {
    totalSuppliers: number;
    totalInventoryListings: number;
    totalCanonicalEntities: number;
    pendingMatchReviews: number;
    autoMatchedCount: number;
    manuallyMatchedCount: number;
    deduplicationRatePercent: number;
    consolidationRatio: string;
  };
  categoryDistribution: Array<{
    category: string;
    key: InventoryCategory;
    rawListings: number;
    canonicalEntities: number;
  }>;
  supplierDistribution: Array<{
    supplierId: string;
    name: string;
    code: string;
    reliabilityScore: number;
    listingCount: number;
  }>;
  recentImports: InventoryImport[];
}
