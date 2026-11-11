import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/v1/inventory
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      supplierId,
      matchStatus,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (category) {
      where.category = category as any;
    }
    if (supplierId) {
      where.supplierId = supplierId as string;
    }
    if (matchStatus) {
      where.matchStatus = matchStatus as any;
    }
    if (search) {
      where.OR = [
        { rawName: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
        { externalId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [total, listings] = await Promise.all([
      prisma.supplierListing.count({ where }),
      prisma.supplierListing.findMany({
        where,
        skip,
        take,
        include: {
          supplier: {
            select: { id: true, name: true, code: true, reliabilityScore: true },
          },
          canonicalEntity: {
            select: { id: true, name: true, destinationCity: true, status: true },
          },
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: listings,
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

// GET /api/v1/inventory/:id
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await prisma.supplierListing.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        canonicalEntity: {
          include: {
            variants: true,
          },
        },
        variants: {
          include: {
            offers: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Supplier listing not found' });
    }

    return res.json({ success: true, data: listing });
  } catch (err) {
    return next(err);
  }
});

export default router;
