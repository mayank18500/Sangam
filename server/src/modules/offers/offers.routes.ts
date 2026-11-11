import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { intelligenceClient } from '../../lib/intelligenceClient.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// GET /api/v1/offers/compare?canonicalEntityId=...
router.get('/compare', async (req, res, next) => {
  try {
    const { canonicalEntityId } = req.query;

    if (!canonicalEntityId) {
      return res.status(400).json({ success: false, message: 'canonicalEntityId query param is required' });
    }

    const entity = await prisma.canonicalEntity.findUnique({
      where: { id: canonicalEntityId as string },
      include: {
        variants: {
          include: {
            supplierVariants: {
              include: {
                supplierListing: {
                  include: {
                    supplier: {
                      select: { id: true, name: true, code: true, reliabilityScore: true },
                    },
                  },
                },
                offers: {
                  include: {
                    rankingResults: {
                      orderBy: { rankPosition: 'asc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!entity) {
      return res.status(404).json({ success: false, message: 'Canonical entity not found' });
    }

    // Flatten offers for comparison matrix
    const comparisonOffers: any[] = [];
    entity.variants.forEach((v) => {
      v.supplierVariants.forEach((sv) => {
        sv.offers.forEach((o) => {
          comparisonOffers.push({
            offerId: o.id,
            variantName: v.name,
            supplierVariantName: sv.rawName,
            supplierName: sv.supplierListing.supplier.name,
            supplierCode: sv.supplierListing.supplier.code,
            supplierReliability: Number(sv.supplierListing.supplier.reliabilityScore),
            currency: o.currency,
            netPrice: Number(o.netPrice),
            basePrice: Number(o.basePrice),
            taxAmount: Number(o.taxAmount),
            cancellationPolicy: o.cancellationPolicy,
            mealPlan: o.mealPlan,
            transferIncluded: o.transferIncluded,
            inclusions: o.inclusions,
            currentRank: o.rankingResults[0]?.rankPosition || null,
            overallScore: o.rankingResults[0]?.overallScore ? Number(o.rankingResults[0].overallScore) : null,
          });
        });
      });
    });

    return res.json({
      success: true,
      data: {
        entity: {
          id: entity.id,
          name: entity.name,
          category: entity.category,
          city: entity.destinationCity,
          country: entity.destinationCountry,
        },
        offers: comparisonOffers.sort((a, b) => (a.currentRank || 99) - (b.currentRank || 99)),
      },
    });
  } catch (err) {
    return next(err);
  }
});

const rankSchema = z.object({
  body: z.object({
    canonicalEntityId: z.string().uuid(),
    priceWeight: z.number().min(0).max(1).optional(),
    reliabilityWeight: z.number().min(0).max(1).optional(),
    cancellationWeight: z.number().min(0).max(1).optional(),
    inclusionsWeight: z.number().min(0).max(1).optional(),
  }),
});

// POST /api/v1/offers/rank
router.post('/rank', requireAuth, validateRequest(rankSchema), async (req, res, next) => {
  try {
    const { canonicalEntityId, priceWeight, reliabilityWeight, cancellationWeight, inclusionsWeight } = req.body;

    // Fetch all active offers under this canonical entity
    const supplierListings = await prisma.supplierListing.findMany({
      where: { canonicalEntityId },
      include: {
        supplier: true,
        variants: {
          include: {
            offers: true,
          },
        },
      },
    });

    const offerInputs: any[] = [];
    supplierListings.forEach((sl) => {
      sl.variants.forEach((v) => {
        v.offers.forEach((o) => {
          const cancelPolicy = o.cancellationPolicy as any;
          offerInputs.push({
            offer_id: o.id,
            supplier_id: sl.supplier.id,
            supplier_name: sl.supplier.name,
            supplier_reliability_score: Number(sl.supplier.reliabilityScore),
            net_price: Number(o.netPrice),
            currency: o.currency,
            cancellation_refundable: cancelPolicy?.refundable ?? true,
            cancellation_deadline_hours: cancelPolicy?.deadline_hours ?? 24,
            transfer_included: o.transferIncluded,
            meal_plan: o.mealPlan,
            inclusions_count: Array.isArray(o.inclusions) ? o.inclusions.length : 0,
            inclusions: Array.isArray(o.inclusions) ? o.inclusions : [],
          });
        });
      });
    });

    if (offerInputs.length === 0) {
      return res.status(404).json({ success: false, message: 'No offers found for this canonical entity' });
    }

    // Call Python ranking service
    const rankingResponse = await intelligenceClient.rankOffers({
      offers: offerInputs,
      price_weight: priceWeight,
      reliability_weight: reliabilityWeight,
      cancellation_weight: cancellationWeight,
      inclusions_weight: inclusionsWeight,
    });

    // Save rankings to database
    for (const r of rankingResponse.ranked_offers) {
      await prisma.rankingResult.create({
        data: {
          queryContext: { canonicalEntityId },
          offerId: r.offer_id,
          rankPosition: r.rank_position,
          overallScore: r.overall_score,
          priceScore: r.breakdown.price_score,
          reliabilityScore: r.breakdown.reliability_score,
          cancellationScore: r.breakdown.cancellation_score,
          scoreBreakdown: {
            justification: r.justification,
            breakdown: r.breakdown,
          },
        },
      });
    }

    return res.json({
      success: true,
      message: 'Offers successfully ranked',
      data: rankingResponse,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
