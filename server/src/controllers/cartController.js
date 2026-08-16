import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

export async function getCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0 });
    }

    // Format items for frontend
    const formattedItems = cart.items
      .filter((item) => item.product && item.product.isActive)
      .map((item) => ({
        product_id: item.product._id.toString(),
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0] || '',
        size: item.size,
        qty: item.qty,
        stock: item.product.stock,
      }));

    const subtotal = formattedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    return res.json({
      success: true,
      cart: {
        id: cart._id.toString(),
        items: formattedItems,
        subtotal,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addItem(req, res, next) {
  try {
    const { productId, size, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
      });
    }

    if (product.stock < quantity) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].qty + quantity;
      if (product.stock < newQty) {
        return res.status(409).json({
          success: false,
          message: `Cannot add more. Maximum stock available is ${product.stock}.`,
        });
      }
      cart.items[existingIndex].qty = newQty;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        size,
        qty: quantity,
        price: product.price,
      });
    }

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function updateItemQty(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity, size } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const product = await Product.findById(productId);
    if (product && product.stock < quantity) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId && (!size || item.size === size)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    cart.items[itemIndex].qty = quantity;
    if (product) cart.items[itemIndex].price = product.price;

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;
    const { size } = req.query;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && (!size || item.size === size))
    );

    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }
    return res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: { items: [], subtotal: 0 },
    });
  } catch (error) {
    next(error);
  }
}
