import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

const createSupplierSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2),
    contactEmail: z.string().email().optional(),
    apiEndpoint: z.string().url().optional(),
    reliabilityScore: z.number().min(0).max(1).optional().default(0.85),
    metadata: z.record(z.any()).optional().default({}),
  }),
});

// GET /api/v1/suppliers
router.get('/', async (_req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            listings: true,
            imports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: suppliers.map((s) => ({
        ...s,
        totalListings: s._count.listings,
        totalImports: s._count.imports,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/suppliers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        imports: { take: 5, orderBy: { startedAt: 'desc' } },
        _count: {
          select: { listings: true, imports: true },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    return res.json({ success: true, data: supplier });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/suppliers
router.post('/', requireAuth, validateRequest(createSupplierSchema), async (req, res, next) => {
  try {
    const { code, name, contactEmail, apiEndpoint, reliabilityScore, metadata } = req.body;
    
    const existing = await prisma.supplier.findUnique({ where: { code } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Supplier with code '${code}' already exists` });
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        contactEmail,
        apiEndpoint,
        reliabilityScore: reliabilityScore || 0.85,
        metadata,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
