import express from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllReviews,
  deleteReview,
  getSalesAnalytics,
  getSingleProductAnalytics,
  getInventoryAnalytics,
  getCategoryAnalytics,
  getCustomerAnalytics,
  getRecentActivity,
  reseedDemoData,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply security middleware to ALL admin routes
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/products/:id', getSingleProductAnalytics);
router.get('/analytics/inventory', getInventoryAnalytics);
router.get('/analytics/categories', getCategoryAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);
router.get('/activity', getRecentActivity);
router.post('/demo/reseed', reseedDemoData);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;
