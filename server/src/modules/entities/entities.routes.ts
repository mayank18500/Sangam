import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/v1/entities
router.get('/', async (req, res, next) => {
  try {
    const { category, city, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (category) {
      where.category = category as any;
    }
    if (city) {
      where.destinationCity = { contains: city as string, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { standardizedName: { contains: search as string, mode: 'insensitive' } },
        { destinationCity: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [total, entities] = await Promise.all([
      prisma.canonicalEntity.count({ where }),
      prisma.canonicalEntity.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              supplierListings: true,
              variants: true,
            },
          },
          supplierListings: {
            select: {
              id: true,
              supplier: { select: { id: true, name: true, code: true, reliabilityScore: true } },
              rawName: true,
              matchConfidence: true,
              matchStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: entities.map((e) => ({
        ...e,
        totalSuppliers: e._count.supplierListings,
        totalVariants: e._count.variants,
      })),
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/entities/:id
router.get('/:id', async (req, res, next) => {
  try {
    const entity = await prisma.canonicalEntity.findUnique({
      where: { id: req.params.id },
      include: {
        supplierListings: {
          include: {
            supplier: true,
            variants: {
              include: {
                offers: {
                  include: {
                    rankingResults: true,
                  },
                },
              },
            },
          },
        },
        variants: {
          include: {
            supplierVariants: {
              include: {
                supplierListing: {
                  include: { supplier: true },
                },
                offers: true,
              },
            },
          },
        },
      },
    });

    if (!entity) {
      return res.status(404).json({ success: false, message: 'Canonical entity not found' });
    }

    return res.json({ success: true, data: entity });
  } catch (err) {
    return next(err);
  }
});

export default router;
