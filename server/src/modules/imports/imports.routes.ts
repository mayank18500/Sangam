import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

const createImportSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid(),
    importRef: z.string().min(3),
    category: z.enum(['HOTEL', 'SIGHTSEEING']),
    totalRecords: z.number().int().min(0).optional().default(0),
  }),
});

// GET /api/v1/imports
router.get('/', async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    const status = req.query.status as any;

    const imports = await prisma.inventoryImport.findMany({
      where: {
        ...(category ? { category: category as any } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        supplier: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    return res.json({
      success: true,
      data: imports,
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/imports
router.post('/', requireAuth, validateRequest(createImportSchema), async (req, res, next) => {
  try {
    const { supplierId, importRef, category, totalRecords } = req.body;

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const inventoryImport = await prisma.inventoryImport.create({
      data: {
        supplierId,
        importRef,
        category,
        totalRecords: totalRecords || 0,
        status: 'PENDING',
      },
      include: {
        supplier: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Inventory import batch initiated',
      data: inventoryImport,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/imports/:id
router.get('/:id', async (req, res, next) => {
  try {
    const inventoryImport = await prisma.inventoryImport.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        listings: { take: 20 },
      },
    });

    if (!inventoryImport) {
      return res.status(404).json({ success: false, message: 'Import not found' });
    }

    return res.json({ success: true, data: inventoryImport });
  } catch (err) {
    return next(err);
  }
});

export default router;
