import express from 'express';
import { getCategories, createCategory } from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { categoryCreateSchema } from '../validators/schemas.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticate, requireAdmin, validate(categoryCreateSchema), createCategory);

export default router;
