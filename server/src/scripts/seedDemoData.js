import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';

import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { ProductEvent } from '../models/ProductEvent.js';
import { Promo } from '../models/Promo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEMO_SEED_ID = 'lume-demo-2026';

export async function seedDemoData() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  console.log('🌱 Starting LUMÉ Demo Seeding Engine (idempotent)...');

  // 1. Clear existing demo records safely
  await Order.deleteMany({ demoSeedId: DEMO_SEED_ID });
  await ProductEvent.deleteMany({ demoSeedId: DEMO_SEED_ID });
  await Review.deleteMany({ demoSeedId: DEMO_SEED_ID });
  await User.deleteMany({ $or: [{ demoSeedId: DEMO_SEED_ID }, { role: 'customer', email: /^demo\.customer/i }] });

  // 2. Ensure Categories exist
  let categories = await Category.find({});
  if (categories.length === 0) {
    const defaultCats = [
      { name: 'Cleansers', slug: 'cleansers', description: 'Gentle daily cleansers' },
      { name: 'Serums', slug: 'serums', description: 'Targeted botanical serums' },
      { name: 'Moisturizers', slug: 'moisturizers', description: 'Barrier restoration creams' },
      { name: 'Sunscreen', slug: 'sunscreen', description: 'Mineral broad-spectrum SPF' },
      { name: 'Exfoliators', slug: 'exfoliators', description: 'Smoothing AHA/BHA peels' },
      { name: 'Masks', slug: 'masks', description: 'Nourishing hydration masks' },
    ];
    categories = await Category.insertMany(defaultCats);
  }

  // 3. Ensure Products exist
  let products = await Product.find({ isActive: true });
  if (products.length === 0) {
    const defaultProducts = [
      {
        name: 'Hyaluronic Hydrating Serum',
        slug: 'hyaluronic-hydrating-serum',
        description: 'Multi-depth hydration with botanical hyaluronic acid and vitamin B5.',
        price: 48,
        compare_at_price: 58,
        category: categories[1]._id,
        images: ['https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg'],
        sizes: ['30ml', '50ml'],
        skin_type: 'dry',
        stock: 28,
        featured: true,
      },
      {
        name: 'Barrier Repair Moisturizer',
        slug: 'barrier-repair-moisturizer',
        description: 'Ceramide-rich barrier restoration cream for sensitive skin.',
        price: 54,
        category: categories[2]._id,
        images: ['https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg'],
        sizes: ['50ml'],
        skin_type: 'sensitive',
        stock: 45,
        featured: true,
      },
      {
        name: 'Gentle Cleansing Balm',
        slug: 'gentle-cleansing-balm',
        description: 'Melt-away oil cleansing balm enriched with sea buckthorn.',
        price: 38,
        category: categories[0]._id,
        images: ['https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg'],
        sizes: ['100ml'],
        skin_type: 'all',
        stock: 4,
        featured: false,
      },
      {
        name: 'Niacinamide Radiance Essence',
        slug: 'niacinamide-radiance-essence',
        description: '10% niacinamide essence to minimize pores and even skin tone.',
        price: 42,
        compare_at_price: 50,
        category: categories[1]._id,
        images: ['https://images.pexels.com/photos/8101532/pexels-photo-8101532.jpeg'],
        sizes: ['100ml'],
        skin_type: 'oily',
        stock: 19,
        featured: true,
      },
      {
        name: 'Mineral Silk SPF 50',
        slug: 'mineral-silk-spf-50',
        description: 'Invisible non-nano zinc oxide sunscreen with sheer finish.',
        price: 46,
        category: categories[3]._id,
        images: ['https://images.pexels.com/photos/5938250/pexels-photo-5938250.jpeg'],
        sizes: ['50ml'],
        skin_type: 'all',
        stock: 0,
        featured: true,
      },
      {
        name: 'AHA Clarifying Treatment',
        slug: 'aha-clarifying-treatment',
        description: 'Exfoliating night liquid with glycolic acid and willow bark.',
        price: 52,
        category: categories[4]._id,
        images: ['https://images.pexels.com/photos/8101529/pexels-photo-8101529.jpeg'],
        sizes: ['30ml'],
        skin_type: 'combination',
        stock: 3,
        featured: false,
      },
      {
        name: 'Calming Clay Mask',
        slug: 'calming-clay-mask',
        description: 'French pink clay mask with chamomile to soothe stressed skin.',
        price: 40,
        category: categories[5]._id,
        images: ['https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg'],
        sizes: ['75ml'],
        skin_type: 'all',
        stock: 32,
        featured: false,
      },
      {
        name: 'Vitamin C Glow Oil',
        slug: 'vitamin-c-glow-oil',
        description: 'THD ascorbate lipid facial oil for immediate luminous radiance.',
        price: 62,
        compare_at_price: 70,
        category: categories[1]._id,
        images: ['https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg'],
        sizes: ['30ml'],
        skin_type: 'dry',
        stock: 2,
        featured: true,
      },
    ];
    products = await Product.insertMany(defaultProducts);
  }

  // Set realistic inventory stock distribution on products (~65% healthy, ~20% low stock 1-5, ~15% out of stock)
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    let newStock = 25 + i * 7;
    if (i === 2 || i === 5 || i === 7) newStock = Math.floor(Math.random() * 4) + 1; // Low stock (1-5)
    if (i === 4) newStock = 0; // Out of stock
    await Product.findByIdAndUpdate(prod._id, { stock: newStock });
  }

  // 4. Ensure Promos exist
  let promos = await Promo.find({});
  if (promos.length === 0) {
    await Promo.insertMany([
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true },
      { code: 'LUME15', discountType: 'percentage', discountValue: 15, isActive: true },
      { code: 'GLOW20', discountType: 'percentage', discountValue: 20, isActive: true },
    ]);
  }

  // 5. Ensure Admin User exists
  let adminUser = await User.findOne({ email: 'admin@lumeskincare.com' });
  if (!adminUser) {
    const adminHash = await bcrypt.hash('AdminPassword123!', 10);
    await User.create({
      name: 'LUMÉ Administrator',
      email: 'admin@lumeskincare.com',
      passwordHash: adminHash,
      role: 'admin',
    });
  }

  // 6. Create ~25 Demo Customer Users
  const passwordHash = await bcrypt.hash('CustomerPassword123!', 10);
  const demoUsers = [];
  const names = [
    'Emma Watson', 'Liam Neeson', 'Sophia Turner', 'Jackson Avery', 'Olivia Wilde',
    'Lucas Scott', 'Mia Thermopolis', 'Noah Bennett', 'Ava Gardner', 'Ethan Hawke',
    'Isabella Rossellini', 'Mason Mount', 'Charlotte Brontë', 'Oliver Twist', 'Amelia Earhart',
    'Harper Lee', 'Elijah Wood', 'Evelyn Hugo', 'James Dean', 'Abigail Spencer',
    'Benjamin Button', 'Ella Fitzgerald', 'Alexander Hamilton', 'Sofia Coppola', 'Daniel Craig'
  ];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const email = `demo.customer${String(i + 1).padStart(2, '0')}@example.com`;
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 330) * 24 * 60 * 60 * 1000);
    demoUsers.push({
      name,
      email,
      passwordHash: passwordHash,
      role: 'customer',
      demoSeedId: DEMO_SEED_ID,
      createdAt,
    });
  }
  const createdUsers = await User.insertMany(demoUsers);

  // 6. Create ~100 Historical Orders over 12 months with natural variation
  const demoOrders = [];
  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'confirmed', 'pending'];
  const promoCodes = ['', '', '', 'WELCOME10', '', 'LUME15', ''];

  for (let i = 0; i < 100; i++) {
    const user = createdUsers[i % createdUsers.length];
    const daysAgo = Math.floor(Math.pow(Math.random(), 1.2) * 365);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const orderItemsCount = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < orderItemsCount; j++) {
      const prod = products[(i + j) % products.length];
      const qty = Math.floor(Math.random() * 2) + 1;
      const price = prod.price;
      subtotal += price * qty;
      orderItems.push({
        product_id: prod._id,
        name: prod.name,
        price,
        qty,
        size: prod.sizes[0] || 'Standard',
        image: prod.images[0],
      });
    }

    const promoCode = promoCodes[i % promoCodes.length];
    let discountPct = 0;
    if (promoCode === 'WELCOME10') discountPct = 10;
    if (promoCode === 'LUME15') discountPct = 15;
    if (promoCode === 'GLOW20') discountPct = 20;

    const discount = Math.round((subtotal * discountPct) / 100 * 100) / 100;
    const shipping = subtotal > 75 ? 0 : 5.95;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    const orderStatus = daysAgo < 3 ? statuses[i % statuses.length] : 'delivered';

    demoOrders.push({
      user: user._id,
      email: user.email,
      items: orderItems,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      promo_code: promoCode,
      paymentStatus: orderStatus === 'cancelled' ? 'failed' : 'paid',
      orderStatus,
      shippingAddress: {
        full_name: user.name,
        address_line1: `${100 + i} Botanical Way`,
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94107',
        country: 'United States',
      },
      demoSeedId: DEMO_SEED_ID,
      createdAt,
    });
  }
  const createdOrders = await Order.insertMany(demoOrders);

  // 7. Create Product Event logs over 90 days with clear top/strong/low performance curve
  const demoEvents = [];
  const ninetyDaysAgo = 90;

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const prod = products[pIdx];
    let eventMultiplier = 15;
    if (pIdx < 2) eventMultiplier = 80;
    else if (pIdx < 5) eventMultiplier = 40;

    for (let day = 0; day < ninetyDaysAgo; day++) {
      const timestamp = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      const viewsCount = Math.floor(Math.random() * eventMultiplier) + (pIdx < 2 ? 10 : 1);
      const cartCount = Math.floor(viewsCount * 0.3);
      const wishCount = Math.floor(viewsCount * 0.2);
      const purchaseCount = Math.floor(viewsCount * 0.15);

      for (let v = 0; v < viewsCount; v++) {
        demoEvents.push({
          product: prod._id,
          eventType: 'view',
          quantity: 1,
          sessionId: `demo-session-${pIdx}-${day}-${v}`,
          demoSeedId: DEMO_SEED_ID,
          timestamp,
        });
      }
      for (let c = 0; c < cartCount; c++) {
        demoEvents.push({
          product: prod._id,
          eventType: 'cart_add',
          quantity: 1,
          sessionId: `demo-session-${pIdx}-${day}-${c}`,
          demoSeedId: DEMO_SEED_ID,
          timestamp,
        });
      }
      for (let w = 0; w < wishCount; w++) {
        demoEvents.push({
          product: prod._id,
          eventType: 'wishlist_add',
          quantity: 1,
          sessionId: `demo-session-${pIdx}-${day}-${w}`,
          demoSeedId: DEMO_SEED_ID,
          timestamp,
        });
      }
      for (let p = 0; p < purchaseCount; p++) {
        demoEvents.push({
          product: prod._id,
          eventType: 'purchase',
          quantity: 1,
          sessionId: `demo-session-${pIdx}-${day}-${p}`,
          demoSeedId: DEMO_SEED_ID,
          timestamp,
        });
      }
    }
  }
  await ProductEvent.insertMany(demoEvents);

  // 8. Create Realistic Demo Reviews for products
  const reviewBodies = [
    { rating: 5, title: 'Incredible texture and results!', body: 'Transformed my dry barrier in 3 days. Will rebuy forever.' },
    { rating: 5, title: 'Holy grail formula', body: 'LUMÉ got the formulation 100% right. Gentle yet effective.' },
    { rating: 4, title: 'Very soothing formula', body: 'Absorbs quickly without sticky residue. Highly recommend.' },
    { rating: 5, title: 'Best botanical serum', body: 'Noticeable radiance booster under my moisturizer.' },
    { rating: 3, title: 'Good but pricey', body: 'Works fine, though I wish the bottle was slightly larger.' },
    { rating: 4, title: 'Subtle and effective', body: 'Helped reduce redness around my nose area.' },
  ];

  const demoReviews = [];
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const reviewCount = i < 3 ? 6 : 3;
    for (let r = 0; r < reviewCount; r++) {
      const user = createdUsers[(i + r) % createdUsers.length];
      const revData = reviewBodies[(i + r) % reviewBodies.length];
      demoReviews.push({
        product: prod._id,
        user: user._id,
        user_name: user.name,
        rating: revData.rating,
        title: revData.title,
        body: revData.body,
        demoSeedId: DEMO_SEED_ID,
        createdAt: new Date(Date.now() - (i * 5 + r * 3) * 24 * 60 * 60 * 1000),
      });
    }
  }
  const createdReviews = await Review.insertMany(demoReviews);

  // Recalculate review_count & rating on Product collection
  for (const prod of products) {
    const prodReviews = await Review.find({ product: prod._id });
    if (prodReviews.length > 0) {
      const avgRating =
        Math.round((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length) * 10) / 10;
      await Product.findByIdAndUpdate(prod._id, {
        rating: avgRating,
        review_count: prodReviews.length,
      });
    }
  }

  const counts = {
    demoCustomers: createdUsers.length,
    demoOrders: createdOrders.length,
    demoEvents: demoEvents.length,
    demoReviews: createdReviews.length,
  };

  console.log(`✅ LUMÉ Demo Seeding Complete!`);
  console.log(`   • Demo Customers: ${counts.demoCustomers}`);
  console.log(`   • Demo Orders: ${counts.demoOrders}`);
  console.log(`   • Demo Product Events: ${counts.demoEvents}`);
  console.log(`   • Demo Reviews: ${counts.demoReviews}`);

  return counts;
}

// Execute directly if called from CLI
if (process.argv[1] && process.argv[1].endsWith('seedDemoData.js')) {
  seedDemoData()
    .then(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Demo Seeding Error:', err);
      process.exit(1);
    });
}
