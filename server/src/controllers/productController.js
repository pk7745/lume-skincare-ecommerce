import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { ProductEvent } from '../models/ProductEvent.js';

export async function getProducts(req, res, next) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      skinType,
      sort,
      featured,
      inStock,
      page = 1,
      limit = 100,
    } = req.query;

    const query = { isActive: true };

    if (featured === 'true') {
      query.featured = true;
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (category) {
      const catDoc = await Category.findOne({
        $or: [
          { slug: category },
          ...(category.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: category }] : []),
        ],
      });
      if (catDoc) {
        query.category = catDoc._id;
      } else {
        return res.json({ success: true, products: [], total: 0, page: Number(page), pages: 0 });
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    if (skinType && skinType !== 'all') {
      query.$or = [{ skin_type: skinType }, { skin_type: 'all' }];
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      });
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'popular') sortOptions = { review_count: -1, rating: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug');

    return res.json({
      success: true,
      products: products.map((p) => p.toJSON()),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    let product;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('category', 'name slug');
    }

    if (!product) {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      product: product.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      product: product.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

// Log product interaction event with cooldown deduplication
export async function logProductEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { eventType, quantity = 1, sessionId } = req.body;

    const allowedTypes = ['view', 'cart_add', 'wishlist_add', 'purchase'];
    if (!allowedTypes.includes(eventType)) {
      return res.status(400).json({ success: false, message: 'Invalid event type' });
    }

    let product = await Product.findById(id);
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const clientSession = sessionId || req.headers['x-session-id'] || req.ip || 'anon';

    // Deduplicate view events within a 1-hour cooldown window per session
    if (eventType === 'view') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentView = await ProductEvent.findOne({
        product: product._id,
        eventType: 'view',
        sessionId: clientSession,
        timestamp: { $gte: oneHourAgo },
      });
      if (recentView) {
        return res.json({ success: true, message: 'View event deduplicated within cooldown' });
      }
    }

    await ProductEvent.create({
      product: product._id,
      eventType,
      quantity: Number(quantity) || 1,
      sessionId: clientSession,
      timestamp: new Date(),
    });

    return res.status(201).json({ success: true, message: 'Event logged successfully' });
  } catch (error) {
    next(error);
  }
}

// Search autocomplete query
export async function searchAutocomplete(req, res, next) {
  try {
    const { q, limit = 6 } = req.query;
    if (!q || !q.trim() || q.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const safeSearch = q.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const searchRegex = new RegExp(safeSearch, 'i');

    const products = await Product.find({
      isActive: true,
      $or: [{ name: searchRegex }, { description: searchRegex }, { skin_type: searchRegex }],
    })
      .limit(Number(limit))
      .populate('category', 'name slug');

    return res.json({
      success: true,
      suggestions: products.map((p) => p.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

// Dynamic Trending Products (30-day normalized formula)
export async function getTrendingProducts(req, res, next) {
  try {
    const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit || '8', 10)));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const eventStats = await ProductEvent.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$product',
          views: { $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] } },
          cartAdds: { $sum: { $cond: [{ $eq: ['$eventType', 'cart_add'] }, '$quantity', 0] } },
          wishlistAdds: { $sum: { $cond: [{ $eq: ['$eventType', 'wishlist_add'] }, 1, 0] } },
          purchases: { $sum: { $cond: [{ $eq: ['$eventType', 'purchase'] }, '$quantity', 0] } },
        },
      },
    ]);

    const maxViews = Math.max(1, ...eventStats.map((e) => e.views));
    const maxCart = Math.max(1, ...eventStats.map((e) => e.cartAdds));
    const maxWish = Math.max(1, ...eventStats.map((e) => e.wishlistAdds));
    const maxPur = Math.max(1, ...eventStats.map((e) => e.purchases));

    const scoredMap = new Map();
    for (const stat of eventStats) {
      const normV = stat.views / maxViews;
      const normC = stat.cartAdds / maxCart;
      const normW = stat.wishlistAdds / maxWish;
      const normP = stat.purchases / maxPur;
      const score = Math.round((normV * 0.2 + normC * 0.25 + normW * 0.15 + normP * 0.4) * 100) / 100;
      scoredMap.set(stat._id.toString(), {
        trendingScore: score,
        views: stat.views,
        cartAdds: stat.cartAdds,
        wishlistAdds: stat.wishlistAdds,
        purchases: stat.purchases,
      });
    }

    let activeProducts = await Product.find({ isActive: true }).populate('category', 'name slug');

    const result = activeProducts.map((p) => {
      const pObj = p.toJSON();
      const stats = scoredMap.get(p._id.toString()) || {
        trendingScore: p.featured ? 0.8 : 0.2,
        views: 0,
        cartAdds: 0,
        wishlistAdds: 0,
        purchases: 0,
      };
      return {
        ...pObj,
        isTrending: true,
        trendingScore: stats.trendingScore,
        analyticsStats: stats,
      };
    });

    result.sort((a, b) => b.trendingScore - a.trendingScore || b.review_count - a.review_count);

    return res.json({
      success: true,
      products: result.slice(0, limitNum),
    });
  } catch (error) {
    next(error);
  }
}

// Dynamic Best Sellers (Paid / Completed Orders Only)
export async function getBestSellers(req, res, next) {
  try {
    const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit || '8', 10)));

    const salesAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          totalUnitsSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: limitNum },
    ]);

    const productIds = salesAgg
      .map((s) => s._id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    let products = [];
    if (productIds.length > 0) {
      products = await Product.find({ _id: { $in: productIds }, isActive: true }).populate('category', 'name slug');
    }

    // Fallback to top reviewed/rating products if order history is sparse
    if (products.length < limitNum) {
      const existingIds = new Set(products.map((p) => p._id.toString()));
      const fillProducts = await Product.find({ _id: { $nin: Array.from(existingIds) }, isActive: true })
        .sort({ review_count: -1, rating: -1 })
        .limit(limitNum - products.length)
        .populate('category', 'name slug');
      products = [...products, ...fillProducts];
    }

    return res.json({
      success: true,
      products: products.map((p) => ({ ...p.toJSON(), isBestSeller: true })),
    });
  } catch (error) {
    next(error);
  }
}

// Dynamic New Arrivals
export async function getNewArrivals(req, res, next) {
  try {
    const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit || '8', 10)));
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .populate('category', 'name slug');

    return res.json({
      success: true,
      products: products.map((p) => ({ ...p.toJSON(), isNewArrival: true })),
    });
  } catch (error) {
    next(error);
  }
}

// Deterministic Product Recommendations (Excludes current product)
export async function getRecommendations(req, res, next) {
  try {
    const { id } = req.params;
    const limitNum = Math.min(8, Math.max(1, parseInt(req.query.limit || '4', 10)));

    let targetProduct = await Product.findById(id);
    if (!targetProduct) {
      targetProduct = await Product.findOne({ slug: id });
    }

    if (!targetProduct) {
      const fallback = await Product.find({ isActive: true }).sort({ rating: -1 }).limit(limitNum);
      return res.json({ success: true, products: fallback.map((p) => p.toJSON()) });
    }

    const currentId = targetProduct._id;
    const minP = targetProduct.price * 0.7;
    const maxP = targetProduct.price * 1.3;

    let related = await Product.find({
      _id: { $ne: currentId },
      isActive: true,
      category: targetProduct.category,
    })
      .sort({ rating: -1, review_count: -1 })
      .limit(limitNum)
      .populate('category', 'name slug');

    // Fill with same skin type if category has fewer items
    if (related.length < limitNum) {
      const existingIds = new Set([currentId.toString(), ...related.map((r) => r._id.toString())]);
      const skinTypeMatches = await Product.find({
        _id: { $nin: Array.from(existingIds) },
        isActive: true,
        $or: [{ skin_type: targetProduct.skin_type }, { price: { $gte: minP, $lte: maxP } }],
      })
        .limit(limitNum - related.length)
        .populate('category', 'name slug');

      related = [...related, ...skinTypeMatches];
    }

    // Graceful fallback to popular products
    if (related.length < limitNum) {
      const existingIds = new Set([currentId.toString(), ...related.map((r) => r._id.toString())]);
      const popularMatches = await Product.find({
        _id: { $nin: Array.from(existingIds) },
        isActive: true,
      })
        .sort({ rating: -1, review_count: -1 })
        .limit(limitNum - related.length)
        .populate('category', 'name slug');

      related = [...related, ...popularMatches];
    }

    return res.json({
      success: true,
      products: related.map((p) => p.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

// Admin Product Management
export async function createProduct(req, res, next) {
  try {
    const {
      name,
      slug,
      description,
      price,
      compare_at_price,
      category_id,
      images,
      sizes,
      skin_type,
      stock,
      featured,
    } = req.body;

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const existing = await Product.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product slug already exists' });
    }

    let categoryObjId = null;
    if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
      categoryObjId = new mongoose.Types.ObjectId(category_id);
    } else if (category_id) {
      const catDoc = await Category.findOne({ slug: category_id });
      if (catDoc) categoryObjId = catDoc._id;
    }

    const product = await Product.create({
      name,
      slug: generatedSlug,
      description,
      price: Number(price),
      compare_at_price: compare_at_price ? Number(compare_at_price) : null,
      category: categoryObjId,
      category_id: categoryObjId ? categoryObjId.toString() : category_id,
      images: Array.isArray(images) ? images : [images],
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      skin_type: skin_type || 'all',
      stock: Number(stock) || 0,
      featured: Boolean(featured),
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    let product = await Product.findById(id);
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, updates);
    await product.save();

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: product.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({}).sort({ sort_order: 1, name: 1 });
    return res.json({
      success: true,
      categories: categories.map((c) => c.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, slug, description, image_url, sort_order } = req.body;
    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const existing = await Category.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category slug already exists' });
    }

    const category = await Category.create({
      name,
      slug: generatedSlug,
      description: description || '',
      image_url: image_url || '',
      sort_order: Number(sort_order) || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: category.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}
