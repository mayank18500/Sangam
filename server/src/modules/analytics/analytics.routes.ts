import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/v1/analytics/overview
router.get('/overview', async (_req, res, next) => {
  try {
    const [
      totalSuppliers,
      totalListings,
      totalCanonicalEntities,
      pendingReviews,
      autoMatchedListings,
      manuallyMatchedListings,
      hotelListingsCount,
      sightseeingListingsCount,
      hotelCanonicalCount,
      sightseeingCanonicalCount,
      suppliersWithCounts,
      recentImports,
    ] = await Promise.all([
      prisma.supplier.count({ where: { status: 'ACTIVE' } }),
      prisma.supplierListing.count(),
      prisma.canonicalEntity.count(),
      prisma.supplierListing.count({
        where: { matchStatus: { in: ['REVIEW_REQUIRED', 'UNMATCHED'] } },
      }),
      prisma.supplierListing.count({ where: { matchStatus: 'AUTO_MATCHED' } }),
      prisma.supplierListing.count({ where: { matchStatus: 'MANUALLY_MATCHED' } }),
      prisma.supplierListing.count({ where: { category: 'HOTEL' } }),
      prisma.supplierListing.count({ where: { category: 'SIGHTSEEING' } }),
      prisma.canonicalEntity.count({ where: { category: 'HOTEL' } }),
      prisma.canonicalEntity.count({ where: { category: 'SIGHTSEEING' } }),
      prisma.supplier.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          reliabilityScore: true,
          _count: {
            select: { listings: true },
          },
        },
        orderBy: { listings: { _count: 'desc' } },
        take: 10,
      }),
      prisma.inventoryImport.findMany({
        take: 5,
        orderBy: { startedAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    // Calculate deduplication metrics
    const totalMatched = autoMatchedListings + manuallyMatchedListings;
    const deduplicationRate = totalListings > 0 ? (totalMatched / totalListings) * 100 : 0;
    const consolidationRatio =
      totalCanonicalEntities > 0 ? (totalListings / totalCanonicalEntities).toFixed(2) : '1.0';

    return res.json({
      success: true,
      data: {
        metrics: {
          totalSuppliers,
          totalInventoryListings: totalListings,
          totalCanonicalEntities,
          pendingMatchReviews: pendingReviews,
          autoMatchedCount: autoMatchedListings,
          manuallyMatchedCount: manuallyMatchedListings,
          deduplicationRatePercent: Number(deduplicationRate.toFixed(1)),
          consolidationRatio: `${consolidationRatio}:1`,
        },
        categoryDistribution: [
          {
            category: 'Hotels',
            key: 'HOTEL',
            rawListings: hotelListingsCount,
            canonicalEntities: hotelCanonicalCount,
          },
          {
            category: 'Sightseeing',
            key: 'SIGHTSEEING',
            rawListings: sightseeingListingsCount,
            canonicalEntities: sightseeingCanonicalCount,
          },
        ],
        supplierDistribution: suppliersWithCounts.map((s) => ({
          supplierId: s.id,
          name: s.name,
          code: s.code,
          reliabilityScore: Number(s.reliabilityScore),
          listingCount: s._count.listings,
        })),
        recentImports: recentImports.map((imp) => ({
          id: imp.id,
          importRef: imp.importRef,
          supplierName: imp.supplier.name,
          category: imp.category,
          status: imp.status,
          totalRecords: imp.totalRecords,
          startedAt: imp.startedAt,
          completedAt: imp.completedAt,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
