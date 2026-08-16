import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

export async function getWishlist(req, res, next) {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate('product');
    const validItems = items.filter((i) => i.product && i.product.isActive);

    const productIds = validItems.map((i) => i.product._id.toString());
    const products = validItems.map((i) => i.product.toJSON());

    return res.json({
      success: true,
      productIds,
      products,
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const existing = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (!existing) {
      await Wishlist.create({
        user: req.user._id,
        product: productId,
      });
    }

    return getWishlist(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    return getWishlist(req, res, next);
  } catch (error) {
    next(error);
  }
}
