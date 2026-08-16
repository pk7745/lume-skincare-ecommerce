import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  validatePromoCode,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { orderCreateSchema, promoCodeSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/promo/validate', validate(promoCodeSchema), validatePromoCode);

router.use(authenticate);

router.post('/', validate(orderCreateSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;
