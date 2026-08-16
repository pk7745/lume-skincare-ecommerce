import Stripe from 'stripe';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';

let stripe = null;
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (env.PAYMENT_MODE === 'mock' || !stripe) {
      // Mock payment mode response
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();

      return res.json({
        success: true,
        mode: 'mock',
        url: `${env.CLIENT_URL}/order-confirmation?orderId=${order._id.toString()}`,
        order: order.toJSON(),
      });
    }

    // Real Stripe Checkout Session
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: order.email,
      client_reference_id: order._id.toString(),
      success_url: `${env.CLIENT_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/checkout?cancelled=true`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.json({
      success: true,
      mode: 'stripe',
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    if (env.PAYMENT_MODE === 'mock' || !stripe) {
      return res.json({ received: true, mode: 'mock' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('[Stripe Webhook Signature Verification Failed]:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          orderStatus: 'processing',
          stripePaymentIntentId: session.payment_intent,
        });
        console.log(`[Stripe Webhook]: Order ${orderId} marked as paid`);
      }
    }

    return res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
