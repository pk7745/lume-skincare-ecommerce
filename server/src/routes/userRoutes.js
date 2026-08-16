import express from 'express';
import {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { addressSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(authenticate);

router.patch('/profile', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressSchema), addAddress);
router.patch('/addresses/:id', validate(addressSchema.partial()), updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
