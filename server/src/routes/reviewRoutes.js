import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { reviewCreateSchema, reviewUpdateSchema } from '../validators/schemas.js';

const router = express.Router({ mergeParams: true });

router.get('/', getProductReviews);
router.post('/', authenticate, validate(reviewCreateSchema), createReview);
router.patch('/:id', authenticate, validate(reviewUpdateSchema), updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
