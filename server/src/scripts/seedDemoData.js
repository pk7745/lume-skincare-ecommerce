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

export async function seedDemoData(force = false) {
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
  if (categories.length === 0 || force) {
    if (force) await Category.deleteMany({});
    const defaultCats = [
      { name: 'Cleansers', slug: 'cleansers', description: 'Gentle daily cleansers that respect skin barrier' },
      { name: 'Serums', slug: 'serums', description: 'Targeted botanical & bio-compatible serums' },
      { name: 'Moisturizers', slug: 'moisturizers', description: 'Barrier restoration & deep hydration creams' },
      { name: 'Sunscreen', slug: 'sunscreen', description: 'Broad-spectrum non-nano mineral SPF protection' },
      { name: 'Exfoliators', slug: 'exfoliators', description: 'Smoothing AHA/BHA peels and gentle enzyme powders' },
      { name: 'Masks', slug: 'masks', description: 'Nourishing clay, overnight, and hydration masks' },
    ];
    categories = await Category.insertMany(defaultCats);
  }

  // Map categories by slug for reliable association
  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // 3. Ensure 18 Distinct Products exist across all 6 categories
  let products = await Product.find({ isActive: true });
  if (products.length < 18 || force) {
    if (force || products.length < 18) await Product.deleteMany({});

    const defaultProducts = [
      // CATEGORY 1: CLEANSER (3 distinct products)
      {
        name: 'Gentle Cleansing Balm',
        slug: 'gentle-cleansing-balm',
        description: 'Melt-away oil cleansing balm enriched with sea buckthorn, jojoba oil, and wild chamomile to dissolve makeup without stripping.',
        price: 38,
        compare_at_price: 45,
        category: catMap['cleansers'] || categories[0]._id,
        images: ['https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg'],
        sizes: ['100ml', '200ml'],
        skin_type: 'all',
        stock: 35,
        featured: true,
      },
      {
        name: 'Purifying Botanical Gel Cleanser',
        slug: 'purifying-botanical-gel-cleanser',
        description: 'Clarifying pH-balanced gel cleanser with green tea, tea tree, and centella asiatica to soothe breakout-prone skin.',
        price: 34,
        category: catMap['cleansers'] || categories[0]._id,
        images: ['https://images.pexels.com/photos/14836428/pexels-photo-14836428.jpeg'],
        sizes: ['150ml'],
        skin_type: 'oily',
        stock: 38,
        featured: false,
      },
      {
        name: 'Restorative Oat Milk Cleanser',
        slug: 'restorative-oat-milk-cleanser',
        description: 'Ultra-nourishing cream cleanser with colloidal oat, squalane, and marshmallow root for delicate, compromised barriers.',
        price: 40,
        compare_at_price: 48,
        category: catMap['cleansers'] || categories[0]._id,
        images: ['https://images.pexels.com/photos/15569182/pexels-photo-15569182.jpeg'],
        sizes: ['150ml', '250ml'],
        skin_type: 'sensitive',
        stock: 28,
        featured: true,
      },

      // CATEGORY 2: SERUMS (3 distinct products)
      {
        name: 'Hyaluronic Hydrating Serum',
        slug: 'hyaluronic-hydrating-serum',
        description: 'Multi-depth moisture replenishment with triple-weight hyaluronic acid, snow mushroom extract, and vitamin B5.',
        price: 48,
        compare_at_price: 58,
        category: catMap['serums'] || categories[1]._id,
        images: ['https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg'],
        sizes: ['30ml', '50ml'],
        skin_type: 'dry',
        stock: 50,
        featured: true,
      },
      {
        name: 'Niacinamide Radiance Essence',
        slug: 'niacinamide-radiance-essence',
        description: '10% niacinamide and zinc PCA essence to refine pore texture, diminish hyperpigmentation, and regulate excess sebum.',
        price: 42,
        compare_at_price: 50,
        category: catMap['serums'] || categories[1]._id,
        images: ['https://images.pexels.com/photos/8101532/pexels-photo-8101532.jpeg'],
        sizes: ['100ml'],
        skin_type: 'oily',
        stock: 36,
        featured: true,
      },
      {
        name: 'Vitamin C Glow Oil',
        slug: 'vitamin-c-glow-oil',
        description: 'High-potency THD ascorbate lipid facial oil with rosehip and sea buckthorn for intense morning luminosity and antioxidant protection.',
        price: 62,
        compare_at_price: 72,
        category: catMap['serums'] || categories[1]._id,
        images: ['https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg'],
        sizes: ['30ml'],
        skin_type: 'combination',
        stock: 24,
        featured: true,
      },

      // CATEGORY 3: MOISTURIZERS (3 distinct products)
      {
        name: 'Barrier Repair Moisturizer',
        slug: 'barrier-repair-moisturizer',
        description: 'Ceramide-rich barrier restoration cream infused with 5 essential ceramides, copper peptides, and squalane.',
        price: 54,
        compare_at_price: 64,
        category: catMap['moisturizers'] || categories[2]._id,
        images: ['https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg'],
        sizes: ['50ml'],
        skin_type: 'sensitive',
        stock: 42,
        featured: true,
      },
      {
        name: 'Velvet Dew Hydrating Gel Cream',
        slug: 'velvet-dew-hydrating-gel-cream',
        description: 'Weightless cooling gel-cream with fermented aloe vera, bamboo extract, and green tea for oil-free 48-hour moisture.',
        price: 46,
        category: catMap['moisturizers'] || categories[2]._id,
        images: ['https://images.pexels.com/photos/36698525/pexels-photo-36698525.jpeg'],
        sizes: ['50ml'],
        skin_type: 'oily',
        stock: 30,
        featured: false,
      },
      {
        name: 'Bakuchiol Overnight Renewal Cream',
        slug: 'bakuchiol-overnight-renewal-cream',
        description: 'Restorative night moisturizer powered by 2% natural bakuchiol, wild pansy extract, and shea butter to smooth texture overnight.',
        price: 65,
        compare_at_price: 75,
        category: catMap['moisturizers'] || categories[2]._id,
        images: ['https://images.pexels.com/photos/18350885/pexels-photo-18350885.jpeg'],
        sizes: ['50ml'],
        skin_type: 'dry',
        stock: 18,
        featured: true,
      },

      // CATEGORY 4: SUNSCREEN (3 distinct products)
      {
        name: 'Mineral Silk SPF 50',
        slug: 'mineral-silk-spf-50',
        description: 'Invisible broad-spectrum non-nano zinc oxide sunscreen with sheer matte finish and zero white cast.',
        price: 46,
        compare_at_price: 54,
        category: catMap['sunscreen'] || categories[3]._id,
        images: ['https://images.pexels.com/photos/5938250/pexels-photo-5938250.jpeg'],
        sizes: ['50ml'],
        skin_type: 'all',
        stock: 40,
        featured: true,
      },
      {
        name: 'Hydrating Daily Defense Sun Mist SPF 40',
        slug: 'hydrating-daily-defense-sun-mist-spf-40',
        description: 'Ultra-fine weightless facial sun mist with aloe vera and broad-spectrum UV filters for easy reapplication over makeup.',
        price: 40,
        category: catMap['sunscreen'] || categories[3]._id,
        images: ['https://images.pexels.com/photos/8384509/pexels-photo-8384509.jpeg'],
        sizes: ['80ml'],
        skin_type: 'combination',
        stock: 25,
        featured: false,
      },
      {
        name: 'Tinted Adaptogen Mineral SPF 30',
        slug: 'tinted-adaptogen-mineral-spf-30',
        description: 'Lightweight tinted mineral sunscreen infused with ashwagandha and iron oxides to protect against blue light and UV.',
        price: 50,
        compare_at_price: 58,
        category: catMap['sunscreen'] || categories[3]._id,
        images: ['https://images.pexels.com/photos/34823989/pexels-photo-34823989.jpeg'],
        sizes: ['50ml'],
        skin_type: 'sensitive',
        stock: 22,
        featured: true,
      },

      // CATEGORY 5: EXFOLIATORS (3 distinct products)
      {
        name: 'AHA Clarifying Night Treatment',
        slug: 'aha-clarifying-night-treatment',
        description: 'Exfoliating night liquid with 8% glycolic acid, lactic acid, and willow bark extract to dissolve dull surface cells.',
        price: 52,
        compare_at_price: 60,
        category: catMap['exfoliators'] || categories[4]._id,
        images: ['https://images.pexels.com/photos/8101529/pexels-photo-8101529.jpeg'],
        sizes: ['30ml'],
        skin_type: 'combination',
        stock: 22,
        featured: false,
      },
      {
        name: 'BHA Pore Refining Polish',
        slug: 'bha-pore-refining-polish',
        description: 'Dual-action physical and chemical exfoliating scrub with 2% salicylic acid and smooth jojoba micro-beads.',
        price: 44,
        category: catMap['exfoliators'] || categories[4]._id,
        images: ['https://images.pexels.com/photos/16008943/pexels-photo-16008943.jpeg'],
        sizes: ['75ml'],
        skin_type: 'oily',
        stock: 34,
        featured: true,
      },
      {
        name: 'Enzyme Radiance Peeling Powder',
        slug: 'enzyme-radiance-peeling-powder',
        description: 'Water-activated micro-powder cleanser with papaya enzymes and rice bran to polish skin without micro-tears.',
        price: 48,
        compare_at_price: 55,
        category: catMap['exfoliators'] || categories[4]._id,
        images: ['https://images.pexels.com/photos/30877766/pexels-photo-30877766.jpeg'],
        sizes: ['60g'],
        skin_type: 'sensitive',
        stock: 29,
        featured: false,
      },

      // CATEGORY 6: MASKS (3 distinct products)
      {
        name: 'Calming French Pink Clay Mask',
        slug: 'calming-french-pink-clay-mask',
        description: 'Detoxifying pink clay treatment with chamomile and elderflower to draw out impurities without dry tightness.',
        price: 40,
        compare_at_price: 48,
        category: catMap['masks'] || categories[5]._id,
        images: ['https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg'],
        sizes: ['75ml'],
        skin_type: 'sensitive',
        stock: 32,
        featured: false,
      },
      {
        name: 'Overnight Deep Moisture Sleep Mask',
        slug: 'overnight-deep-moisture-sleep-mask',
        description: 'Intensive leave-on gel mask with blue tansy oil, hyaluronic acid, and spirulina to replenish skin during deep sleep.',
        price: 56,
        compare_at_price: 65,
        category: catMap['masks'] || categories[5]._id,
        images: ['https://images.pexels.com/photos/6925512/pexels-photo-6925512.jpeg'],
        sizes: ['75ml'],
        skin_type: 'dry',
        stock: 26,
        featured: true,
      },
      {
        name: 'Activated Bamboo Charcoal Detox Mask',
        slug: 'activated-bamboo-charcoal-detox-mask',
        description: 'Purifying pore mask with activated bamboo charcoal, kaolin clay, and tea tree to absorb excess sebum and clarify pores.',
        price: 42,
        category: catMap['masks'] || categories[5]._id,
        images: ['https://images.pexels.com/photos/8076094/pexels-photo-8076094.jpeg'],
        sizes: ['75ml'],
        skin_type: 'oily',
        stock: 36,
        featured: true,
      },
    ];
    products = await Product.insertMany(defaultProducts);
  }

  // Set realistic inventory stock distribution on products (~65% healthy, ~20% low stock 1-5, ~15% out of stock)
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    let newStock = 25 + i * 5;
    if (i === 2 || i === 7 || i === 13) newStock = Math.floor(Math.random() * 4) + 1; // Low stock (1-5)
    if (i === 10 || i === 15) newStock = 0; // Out of stock
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
    demoUsers.push({
      name,
      email,
      passwordHash,
      role: 'customer',
      phone: `+91 98765 ${10000 + i}`,
      demoSeedId: DEMO_SEED_ID,
    });
  }
  const createdUsers = await User.insertMany(demoUsers);

  // 7. Create ~100 Historical Orders over 12 months with natural variation
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
        city: 'Mumbai',
        state: 'MH',
        postal_code: '400001',
        country: 'India',
      },
      demoSeedId: DEMO_SEED_ID,
      createdAt,
    });
  }
  await Order.insertMany(demoOrders);

  // 8. Create Product Event logs over 90 days with clear top/strong/low performance curve
  const demoEvents = [];
  const ninetyDaysAgo = 90;

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const prod = products[pIdx];
    let eventMultiplier = 15;
    if (pIdx < 4) eventMultiplier = 80;
    else if (pIdx < 10) eventMultiplier = 40;

    for (let day = 0; day < ninetyDaysAgo; day++) {
      const timestamp = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      const viewsCount = Math.floor(Math.random() * eventMultiplier) + (pIdx < 4 ? 10 : 1);
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

  // 9. Create Realistic Demo Reviews for all products
  const reviewBodies = [
    { rating: 5, title: 'Incredible texture and results!', body: 'Transformed my skin barrier in 3 days. Will rebuy forever.' },
    { rating: 5, title: 'Holy grail formula', body: 'LUMÉ got the formulation 100% right. Gentle yet effective.' },
    { rating: 4, title: 'Very soothing formula', body: 'Absorbs quickly without sticky residue. Highly recommend.' },
    { rating: 5, title: 'Best botanical ritual', body: 'Noticeable radiance booster under my moisturizer.' },
    { rating: 4, title: 'Subtle and effective', body: 'Helped reduce redness and balance oil production.' },
  ];

  const demoReviews = [];
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const reviewCount = i < 6 ? 5 : 3;
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
  await Review.insertMany(demoReviews);

  // Recalculate review_count & rating on Product collection
  for (const prod of products) {
    const prodReviews = await Review.find({ product: prod._id });
    if (prodReviews.length > 0) {
      const avgRating =
        Math.round((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length) * 10) / 10;
      await Product.findByIdAndUpdate(prod._id, {
        rating: avgRating,
        reviewCount: prodReviews.length,
      });
    }
  }

  console.log('✅ LUMÉ Demo Seeding Complete!');
  console.log(`   • Demo Categories: ${categories.length}`);
  console.log(`   • Demo Products: ${products.length}`);
  console.log(`   • Demo Customers: ${createdUsers.length}`);
  console.log(`   • Demo Orders: ${demoOrders.length}`);
  console.log(`   • Demo Product Events: ${demoEvents.length}`);
  console.log(`   • Demo Reviews: ${demoReviews.length}`);
}

// Allow direct CLI execution: node server/src/scripts/seedDemoData.js
if (process.argv[1] && process.argv[1].endsWith('seedDemoData.js')) {
  seedDemoData(true)
    .then(() => {
      console.log('Seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
