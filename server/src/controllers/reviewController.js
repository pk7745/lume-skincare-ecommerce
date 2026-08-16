import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

async function updateProductRatingStats(productId) {
  const reviews = await Review.find({ product: productId });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const roundedRating = Math.round(avg * 10) / 10;

  await Product.findByIdAndUpdate(productId, {
    rating: roundedRating,
    review_count: count,
    reviewCount: count,
  });
}

export async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    let prodId = productId;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      const prod = await Product.findOne({ slug: productId });
      if (prod) prodId = prod._id.toString();
    }

    const reviews = await Review.find({ product: prodId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      reviews: reviews.map((r) => r.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const { productId } = req.params;
    const { rating, title, body } = req.body;

    let product = await Product.findById(productId);
    if (!product) {
      product = await Product.findOne({ slug: productId });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check duplicate review
    const existing = await Review.findOne({
      product: product._id,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Check verified purchase
    const orderWithProduct = await Order.findOne({
      user: req.user._id,
      'items.product_id': product._id.toString(),
      paymentStatus: 'paid',
    });

    const userName = req.user.name || req.user.email.split('@')[0];

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      user_name: userName,
      rating,
      title: title || '',
      body,
      verifiedPurchase: !!orderWithProduct,
    });

    await updateProductRatingStats(product._id);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: review.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this review',
      });
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.title !== undefined) review.title = req.body.title;
    if (req.body.body !== undefined) review.body = req.body.body;

    await review.save();
    await updateProductRatingStats(review.product);

    return res.json({
      success: true,
      message: 'Review updated successfully',
      review: review.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this review',
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);
    await updateProductRatingStats(productId);

    return res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
