import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  searchAutocomplete,
  getTrendingProducts,
  getBestSellers,
  getNewArrivals,
  getRecommendations,
  logProductEvent,
} from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public discovery routes
router.get('/', getProducts);
router.get('/search/autocomplete', searchAutocomplete);
router.get('/trending', getTrendingProducts);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/recommendations', getRecommendations);
router.post('/:id/event', logProductEvent);
router.get('/:id', getProductById);

// Protected Admin Routes
router.post('/', authenticate, requireAdmin, createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
