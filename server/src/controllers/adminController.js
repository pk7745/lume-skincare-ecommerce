import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { ProductEvent } from '../models/ProductEvent.js';
import { seedDemoData } from '../scripts/seedDemoData.js';

export async function getDashboardStats(req, res, next) {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments({});

    const salesAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } },
    ]);
    const totalSales = salesAgg[0]?.totalSales || 0;
    const aov = totalOrders > 0 ? Math.round((totalSales / totalOrders) * 100) / 100 : 0;

    const lowStockCount = await Product.countDocuments({ isActive: true, stock: { $lte: 5 } });

    // Period-over-Period trend calculations (30d vs prior 30d)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const currSalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const prevSalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);

    const currSales = currSalesAgg[0]?.total || 0;
    const prevSales = prevSalesAgg[0]?.total || 1;
    const revenueTrendPct = Math.round(((currSales - prevSales) / prevSales) * 100 * 10) / 10;

    const currOrderCount = currSalesAgg[0]?.count || 0;
    const prevOrderCount = prevSalesAgg[0]?.count || 1;
    const ordersTrendPct = Math.round(((currOrderCount - prevOrderCount) / prevOrderCount) * 100 * 10) / 10;

    const currAov = currOrderCount > 0 ? currSales / currOrderCount : 0;
    const prevAov = prevOrderCount > 0 ? prevSales / prevOrderCount : 1;
    const aovTrendPct = Math.round(((currAov - prevAov) / prevAov) * 100 * 10) / 10;

    // Conversion rate: purchases / total views
    const totalViews = await ProductEvent.countDocuments({ eventType: 'view' });
    const totalPurchases = await ProductEvent.countDocuments({ eventType: 'purchase' });
    const conversionRate = totalViews > 0 ? Math.round((totalPurchases / totalViews) * 100 * 10) / 10 : 3.4;

    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('id email total orderStatus paymentStatus createdAt');

    // Top Products derived from MongoDB order unit sales
    const topSalesAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]);

    const topProductIds = topSalesAgg.map((s) => s._id).filter((id) => mongoose.Types.ObjectId.isValid(id));
    const topProductDocs = await Product.find({ _id: { $in: topProductIds } }).populate('category', 'name slug');

    const topProductsFormatted = topSalesAgg.map((s) => {
      const pDoc = topProductDocs.find((p) => p._id.toString() === s._id.toString());
      return {
        id: pDoc ? pDoc._id.toString() : s._id.toString(),
        name: pDoc ? pDoc.name : 'Formula Item',
        slug: pDoc ? pDoc.slug : 'product',
        category: pDoc?.category?.name || 'Skincare',
        image: pDoc?.images[0] || 'https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg',
        price: pDoc ? pDoc.price : 48,
        stock: pDoc ? pDoc.stock : 15,
        unitsSold: s.unitsSold,
        revenue: Math.round(s.revenue * 100) / 100,
      };
    });

    return res.json({
      success: true,
      stats: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        totalCustomers,
        totalProducts,
        aov,
        conversionRate,
        lowStockCount,
        trends: {
          revenueTrendPct,
          ordersTrendPct,
          aovTrendPct,
        },
        recentOrders: recentOrders.map((o) => o.toJSON()),
        topProducts: topProductsFormatted,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Sales & Orders Line Graph Aggregation (7d, 30d, 90d, 12m)
export async function getSalesAnalytics(req, res, next) {
  try {
    const { range = '30d' } = req.query;
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;
    else if (range === '12m') days = 365;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const salesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: range === '12m' ? '%Y-%m' : '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = salesOverTime.map((item) => ({
      date: item._id,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
    }));

    return res.json({
      success: true,
      range,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

// Single Product Detailed Performance Analytics
export async function getSingleProductAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    let product;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('category', 'name slug');
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productId = product._id;

    // Event aggregation
    const events = await ProductEvent.aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' },
        },
      },
    ]);

    const views = events.find((e) => e._id === 'view')?.count || 0;
    const cartAdds = events.find((e) => e._id === 'cart_add')?.quantity || 0;
    const wishlistAdds = events.find((e) => e._id === 'wishlist_add')?.count || 0;

    // Order units sold and revenue from Orders collection
    const salesAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.product_id': productId.toString() } },
      {
        $group: {
          _id: null,
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
    ]);

    const unitsSold = salesAgg[0]?.unitsSold || 0;
    const revenue = Math.round((salesAgg[0]?.revenue || 0) * 100) / 100;
    const conversionRate = views > 0 ? Math.round((unitsSold / views) * 100 * 10) / 10 : 4.2;

    // Historical sales graph
    const historicalSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.product_id': productId.toString() } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          units: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({
      success: true,
      product: product.toJSON(),
      analytics: {
        views,
        cartAdds,
        wishlistAdds,
        unitsSold,
        revenue,
        conversionRate,
        currentStock: product.stock,
        rating: product.rating,
        reviewCount: product.review_count,
        demandLevel: unitsSold > 30 ? 'High Demand' : unitsSold > 10 ? 'Moderate Demand' : 'Standard Demand',
        historicalSales: historicalSales.map((h) => ({
          date: h._id,
          units: h.units,
          revenue: Math.round(h.revenue * 100) / 100,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

// Inventory Analytics & Health
export async function getInventoryAnalytics(req, res, next) {
  try {
    const products = await Product.find({ isActive: true }).populate('category', 'name slug');

    let totalValuation = 0;
    let healthyCount = 0;
    let lowStockCount = 0; // stock <= 5
    let outOfStockCount = 0;

    const items = products.map((p) => {
      totalValuation += p.price * p.stock;
      if (p.stock === 0) outOfStockCount++;
      else if (p.stock <= 5) lowStockCount++;
      else healthyCount++;

      return {
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        category: p.category?.name || 'Unassigned',
        price: p.price,
        stock: p.stock,
        status: p.stock === 0 ? 'out_of_stock' : p.stock <= 5 ? 'low_stock' : 'healthy',
      };
    });

    return res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalValuation: Math.round(totalValuation * 100) / 100,
        healthyCount,
        lowStockCount,
        outOfStockCount,
      },
      items,
    });
  } catch (error) {
    next(error);
  }
}

// Category Performance Analytics
export async function getCategoryAnalytics(req, res, next) {
  try {
    const categories = await Category.find({});
    const totalOrderSalesAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const overallRevenue = totalOrderSalesAgg[0]?.total || 1;

    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id, isActive: true });

        const salesAgg = await Order.aggregate([
          { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product_id',
              foreignField: '_id',
              as: 'prod',
            },
          },
          { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
          { $match: { 'prod.category': cat._id } },
          {
            $group: {
              _id: null,
              unitsSold: { $sum: '$items.qty' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
            },
          },
        ]);

        const revenue = Math.round((salesAgg[0]?.revenue || 0) * 100) / 100;
        const revenuePct = Math.round((revenue / overallRevenue) * 100 * 10) / 10;

        return {
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          productCount,
          unitsSold: salesAgg[0]?.unitsSold || 0,
          revenue,
          revenuePct,
        };
      })
    );

    return res.json({
      success: true,
      categories: categoryStats,
    });
  } catch (error) {
    next(error);
  }
}

// Customer Analytics
export async function getCustomerAnalytics(req, res, next) {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await User.countDocuments({ role: 'customer', createdAt: { $gte: thirtyDaysAgo } });

    const orderFreq = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]);

    const returningCustomers = orderFreq.filter((o) => o.orderCount > 1).length;
    const avgOrdersPerCustomer =
      orderFreq.length > 0
        ? Math.round((orderFreq.reduce((s, o) => s + o.orderCount, 0) / orderFreq.length) * 10) / 10
        : 0;

    const totalSpentSum = orderFreq.reduce((s, o) => s + o.totalSpent, 0);
    const avgCustomerLifetimeValue =
      orderFreq.length > 0 ? Math.round((totalSpentSum / orderFreq.length) * 100) / 100 : 0;

    return res.json({
      success: true,
      metrics: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        avgOrdersPerCustomer,
        avgCustomerLifetimeValue,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Store Recent Activity Feed
export async function getRecentActivity(req, res, next) {
  try {
    const [orders, reviews, newUsers] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).limit(5).select('id email total orderStatus createdAt'),
      Review.find({}).sort({ createdAt: -1 }).limit(5).select('id title rating user_name createdAt'),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).select('id name email createdAt'),
    ]);

    const activities = [
      ...orders.map((o) => ({
        type: 'order',
        title: `New order #${o.id.slice(0, 8)} (${o.orderStatus})`,
        meta: `${o.email} — $${o.total}`,
        timestamp: o.createdAt,
      })),
      ...reviews.map((r) => ({
        type: 'review',
        title: `New review on product (${r.rating} ★)`,
        meta: `By ${r.user_name}: "${r.title || 'Review'}"`,
        timestamp: r.createdAt,
      })),
      ...newUsers.map((u) => ({
        type: 'customer',
        title: `New customer registered`,
        meta: `${u.name || u.email}`,
        timestamp: u.createdAt,
      })),
    ];

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      success: true,
      activities: activities.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
}

// Admin Reseed Demo Data API
export async function reseedDemoData(req, res, next) {
  try {
    const counts = await seedDemoData();
    return res.json({
      success: true,
      message: 'Demo data reseeded successfully',
      counts,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json({
      success: true,
      orders: orders.map((o) => o.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'Order status updated',
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return res.json({
      success: true,
      reviews: reviews.map((r) => r.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    return res.json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
}
