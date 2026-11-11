import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { intelligenceClient } from '../../lib/intelligenceClient.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

const decisionSchema = z.object({
  body: z.object({
    sourceListingId: z.string().uuid(),
    targetCanonicalId: z.string().uuid(),
    decision: z.enum(['MANUAL_CONFIRM', 'MANUAL_REJECT', 'SPLIT']),
    explanation: z.record(z.any()).optional().default({}),
  }),
});

const runMatchSchema = z.object({
  body: z.object({
    sourceListingId: z.string().uuid(),
  }),
});

// GET /api/v1/matching/pending
router.get('/pending', async (_req, res, next) => {
  try {
    const pendingListings = await prisma.supplierListing.findMany({
      where: {
        matchStatus: {
          in: ['REVIEW_REQUIRED', 'UNMATCHED'],
        },
      },
      include: {
        supplier: {
          select: { id: true, name: true, code: true, reliabilityScore: true },
        },
        canonicalEntity: {
          select: { id: true, name: true, destinationCity: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: pendingListings,
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/matching/decision
router.post('/decision', requireAuth, validateRequest(decisionSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sourceListingId, targetCanonicalId, decision, explanation } = req.body;

    const sourceListing = await prisma.supplierListing.findUnique({
      where: { id: sourceListingId },
    });

    if (!sourceListing) {
      return res.status(404).json({ success: false, message: 'Source listing not found' });
    }

    let updatedStatus: any = 'REVIEW_REQUIRED';
    let canonicalEntityId: string | null = null;

    if (decision === 'MANUAL_CONFIRM') {
      updatedStatus = 'MANUALLY_MATCHED';
      canonicalEntityId = targetCanonicalId;
    } else if (decision === 'MANUAL_REJECT') {
      updatedStatus = 'REJECTED';
      canonicalEntityId = null;
    } else if (decision === 'SPLIT') {
      // Split creates a new canonical entity from the distinct listing!
      const newCanonical = await prisma.canonicalEntity.create({
        data: {
          category: sourceListing.category,
          name: sourceListing.rawName,
          standardizedName: sourceListing.normalizedName,
          destinationCity: sourceListing.city || 'Unknown',
          destinationCountry: sourceListing.country || 'Unknown',
          latitude: sourceListing.latitude,
          longitude: sourceListing.longitude,
          starRating: sourceListing.starRating,
          address: sourceListing.rawAddress,
          description: sourceListing.rawDescription,
        },
      });
      canonicalEntityId = newCanonical.id;
      updatedStatus = 'MANUALLY_MATCHED';
    }

    // Update listing
    const updatedListing = await prisma.supplierListing.update({
      where: { id: sourceListingId },
      data: {
        matchStatus: updatedStatus,
        canonicalEntityId,
      },
    });

    // Record audit decision
    const matchDecision = await prisma.matchDecision.create({
      data: {
        entityType: 'ENTITY',
        sourceListingId,
        targetCanonicalId: canonicalEntityId || targetCanonicalId,
        decision,
        confidenceScore: 1.0,
        explanation: {
          ...explanation,
          reviewedBy: req.user?.email || 'analyst',
        },
        decidedByUserId: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: `Match decision '${decision}' successfully applied`,
      data: {
        listing: updatedListing,
        decision: matchDecision,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/matching/run
router.post('/run', requireAuth, validateRequest(runMatchSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sourceListingId } = req.body;

    const source = await prisma.supplierListing.findUnique({
      where: { id: sourceListingId },
    });
    if (!source) {
      return res.status(404).json({ success: false, message: 'Source listing not found' });
    }

    // Fetch candidate canonical entities in the same category
    const candidates = await prisma.canonicalEntity.findMany({
      where: { category: source.category },
      take: 20,
    });

    // Call Python intelligence service
    const matchResponse = await intelligenceClient.matchEntities({
      source: {
        id: source.id,
        name: source.rawName,
        category: source.category,
        city: source.city,
        country: source.country,
        latitude: source.latitude ? Number(source.latitude) : null,
        longitude: source.longitude ? Number(source.longitude) : null,
        address: source.rawAddress,
        star_rating: source.starRating ? Number(source.starRating) : null,
        description: source.rawDescription,
      },
      candidates: candidates.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        destination_city: c.destinationCity,
        destination_country: c.destinationCountry,
        latitude: c.latitude ? Number(c.latitude) : null,
        longitude: c.longitude ? Number(c.longitude) : null,
        address: c.address,
        star_rating: c.starRating ? Number(c.starRating) : null,
        description: c.description,
      })),
    });

    // If auto-matched, update the database
    if (matchResponse.best_match && matchResponse.best_match.match_status === 'AUTO_MATCHED') {
      await prisma.supplierListing.update({
        where: { id: source.id },
        data: {
          canonicalEntityId: matchResponse.best_match.canonical_id,
          matchStatus: 'AUTO_MATCHED',
          matchConfidence: matchResponse.best_match.overall_confidence,
        },
      });

      await prisma.matchDecision.create({
        data: {
          entityType: 'ENTITY',
          sourceListingId: source.id,
          targetCanonicalId: matchResponse.best_match.canonical_id,
          decision: 'AUTO_ACCEPT',
          confidenceScore: matchResponse.best_match.overall_confidence,
          explanation: {
            breakdown: matchResponse.best_match.score_breakdown,
            reasoning: matchResponse.best_match.reasoning,
          },
          decidedByUserId: req.user?.userId,
        },
      });
    }

    return res.json({
      success: true,
      data: matchResponse,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
