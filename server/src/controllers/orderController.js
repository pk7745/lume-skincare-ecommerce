import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Promo } from '../models/Promo.js';

const VALID_PROMOS = {
  WELCOME10: 0.1,
  LUME15: 0.15,
  GLOW20: 0.2,
};

export async function validatePromoCode(req, res, next) {
  try {
    const { code } = req.body;
    const upperCode = code.toUpperCase().trim();

    // Check DB first
    const promoDoc = await Promo.findOne({ code: upperCode, isActive: true });
    if (promoDoc) {
      return res.json({
        success: true,
        promo: {
          code: promoDoc.code,
          discountType: promoDoc.discountType,
          discountValue: promoDoc.discountValue,
        },
      });
    }

    if (VALID_PROMOS[upperCode] !== undefined) {
      return res.json({
        success: true,
        promo: {
          code: upperCode,
          discountType: 'percentage',
          discountValue: VALID_PROMOS[upperCode] * 100,
        },
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Invalid or expired promo code',
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { items: clientItems, shipping_address, promoCode } = req.body;

    if (!clientItems || clientItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items cannot be empty',
      });
    }

    // Retrieve database products and calculate exact prices & stock validation
    let subtotal = 0;
    const verifiedItems = [];
    const stockUpdates = [];

    for (const item of clientItems) {
      let product = await Product.findById(item.product_id);
      if (!product) {
        product = await Product.findOne({ slug: item.slug || item.product_id });
      }

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" is no longer available`,
        });
      }

      if (product.stock < item.qty) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      const itemPrice = Number(product.price);
      subtotal += itemPrice * item.qty;

      verifiedItems.push({
        product_id: product._id.toString(),
        name: product.name,
        price: itemPrice,
        qty: item.qty,
        image: product.images[0] || item.image,
        size: item.size,
      });

      stockUpdates.push({
        product,
        newStock: product.stock - item.qty,
      });
    }

    // Calculate discount server-side and round to 2 decimals
    let rawDiscount = 0;
    let validPromoCode = '';
    if (promoCode) {
      const upper = promoCode.toUpperCase().trim();
      const dbPromo = await Promo.findOne({ code: upper, isActive: true });
      if (dbPromo) {
        validPromoCode = dbPromo.code;
        if (dbPromo.discountType === 'percentage') {
          rawDiscount = subtotal * (dbPromo.discountValue / 100);
        } else {
          rawDiscount = dbPromo.discountValue;
        }
      } else if (VALID_PROMOS[upper] !== undefined) {
        validPromoCode = upper;
        rawDiscount = subtotal * VALID_PROMOS[upper];
      }
    }

    const discount = Math.round(rawDiscount * 100) / 100;
    const shipping = subtotal > 75 ? 0 : subtotal > 0 ? 6.95 : 0;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    // Safely update product stock
    for (const update of stockUpdates) {
      update.product.stock = update.newStock;
      await update.product.save();
    }

    // Create order doc
    const order = await Order.create({
      user: req.user._id,
      user_id: req.user._id.toString(),
      email: req.user.email,
      items: verifiedItems,
      shippingAddress: shipping_address,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      promoCode: validPromoCode,
      paymentStatus: 'paid', // Mock mode or default
      orderStatus: 'confirmed',
    });

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], subtotal: 0 });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      orders: orders.map((o) => o.toJSON()),
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Customer can access only their own order; Admin can access all
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order',
      });
    }

    return res.json({
      success: true,
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
}
