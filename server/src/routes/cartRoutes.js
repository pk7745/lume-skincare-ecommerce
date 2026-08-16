import express from 'express';
import {
  getCart,
  addItem,
  updateItemQty,
  removeItem,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { cartItemSchema, cartUpdateQtySchema } from '../validators/schemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(cartItemSchema), addItem);
router.patch('/items/:productId', validate(cartUpdateQtySchema), updateItemQty);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

export default router;
