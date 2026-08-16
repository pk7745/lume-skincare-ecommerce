import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Promo } from '../models/Promo.js';

const categoriesData = [
  {
    name: 'Cleansers',
    slug: 'cleansers',
    description: 'Gentle yet effective formulas to remove impurities while respecting your skin barrier.',
    sort_order: 1,
  },
  {
    name: 'Serums',
    slug: 'serums',
    description: 'Concentrated actives that target specific concerns — from brightness to firmness.',
    sort_order: 2,
  },
  {
    name: 'Moisturizers',
    slug: 'moisturizers',
    description: 'Lock in hydration with lightweight gels and rich creams for every skin type.',
    sort_order: 3,
  },
  {
    name: 'Sun Protection',
    slug: 'sun-protection',
    description: 'Daily SPF that protects without the white cast. Non-negotiable for healthy skin.',
    sort_order: 4,
  },
  {
    name: 'Masks & Treatments',
    slug: 'masks-treatments',
    description: 'Weekly rituals for an instant boost — clay, sheet, and overnight treatments.',
    sort_order: 5,
  },
  {
    name: 'Lip & Eye Care',
    slug: 'lip-eye-care',
    description: 'Targeted care for delicate areas. Smooth, brighten, and protect.',
    sort_order: 6,
  },
];

const productsData = [
  // Cleansers
  {
    slug: 'gentle-gel-cleanser',
    name: 'Gentle Gel Cleanser',
    description: 'A pH-balanced gel cleanser that lifts away makeup, SPF, and excess oil without stripping the skin barrier. Formulated with glycerin and green tea extract for a clean, comfortable finish.',
    price: 28.0,
    compare_at_price: null,
    categorySlug: 'cleansers',
    images: [
      'https://images.pexels.com/photos/14836428/pexels-photo-14836428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/15168957/pexels-photo-15168957.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8015835/pexels-photo-8015835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['150ml', '250ml'],
    skin_type: 'all',
    stock: 120,
    rating: 4.7,
    reviewCount: 89,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'clarifying-foam-wash',
    name: 'Clarifying Foam Wash',
    description: 'A deep-cleansing foam that targets congestion and excess sebum. Salicylic acid and niacinamide work together to refine pores and balance oil production.',
    price: 32.0,
    compare_at_price: null,
    categorySlug: 'cleansers',
    images: [
      'https://images.pexels.com/photos/16008943/pexels-photo-16008943.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30877766/pexels-photo-30877766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['150ml'],
    skin_type: 'oily',
    stock: 85,
    rating: 4.5,
    reviewCount: 64,
    featured: false,
    newArrival: false,
  },
  {
    slug: 'cream-to-milk-cleanser',
    name: 'Cream-to-Milk Cleanser',
    description: 'A nourishing cleanser that transforms from a rich cream to a silky milk upon contact with water. Perfect for dry and sensitive skin — removes impurities while leaving skin soft and supple.',
    price: 30.0,
    compare_at_price: null,
    categorySlug: 'cleansers',
    images: [
      'https://images.pexels.com/photos/15569182/pexels-photo-15569182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/16378446/pexels-photo-16378446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['150ml', '250ml'],
    skin_type: 'dry',
    stock: 95,
    rating: 4.8,
    reviewCount: 72,
    featured: true,
    newArrival: true,
  },
  {
    slug: 'daily-micellar-water',
    name: 'Daily Micellar Water',
    description: 'A no-rinse cleanser powered by micellar technology. Gently captures makeup, dirt, and oil in a single sweep. Infused with rose water and chamomile for a soothing finish.',
    price: 22.0,
    compare_at_price: 28.0,
    categorySlug: 'cleansers',
    images: [
      'https://images.pexels.com/photos/15893283/pexels-photo-15893283.png?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8015835/pexels-photo-8015835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['200ml', '400ml'],
    skin_type: 'all',
    stock: 200,
    rating: 4.4,
    reviewCount: 51,
    featured: false,
    newArrival: false,
  },

  // Serums
  {
    slug: 'vitamin-c-brightening-serum',
    name: 'Vitamin C Brightening Serum',
    description: 'A 15% L-ascorbic acid serum that visibly brightens, evens skin tone, and protects against environmental stress. Lightweight, fast-absorbing, and layers seamlessly under moisturizer.',
    price: 58.0,
    compare_at_price: null,
    categorySlug: 'serums',
    images: [
      'https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8101529/pexels-photo-8101529.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/7885948/pexels-photo-7885948.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['30ml'],
    skin_type: 'all',
    stock: 150,
    rating: 4.8,
    reviewCount: 203,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'hyaluronic-hydration-serum',
    name: 'Hyaluronic Hydration Serum',
    description: 'A multi-weight hyaluronic acid serum that draws moisture into every layer of the skin. Plumps fine lines and delivers a dewy, glass-skin finish.',
    price: 48.0,
    compare_at_price: null,
    categorySlug: 'serums',
    images: [
      'https://images.pexels.com/photos/8101511/pexels-photo-8101511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8100777/pexels-photo-8100777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['30ml', '50ml'],
    skin_type: 'all',
    stock: 175,
    rating: 4.7,
    reviewCount: 156,
    featured: true,
    newArrival: true,
  },
  {
    slug: 'retinol-renewal-serum',
    name: 'Retinol Renewal Serum',
    description: 'A 0.3% encapsulated retinol serum that smooths texture, refines pores, and reduces the appearance of fine lines. Time-release technology minimizes irritation for gradual, visible results.',
    price: 65.0,
    compare_at_price: null,
    categorySlug: 'serums',
    images: [
      'https://images.pexels.com/photos/12146904/pexels-photo-12146904.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/27357170/pexels-photo-27357170.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['30ml'],
    skin_type: 'all',
    stock: 90,
    rating: 4.6,
    reviewCount: 98,
    featured: false,
    newArrival: false,
  },
  {
    slug: 'niacinamide-pore-refining-serum',
    name: 'Niacinamide Pore Refining Serum',
    description: 'A 10% niacinamide serum that visibly minimizes pore size, regulates oil, and strengthens the skin barrier. Paired with zinc PCA for balanced, clear skin.',
    price: 42.0,
    compare_at_price: 52.0,
    categorySlug: 'serums',
    images: [
      'https://images.pexels.com/photos/7797735/pexels-photo-7797735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8101673/pexels-photo-8101673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['30ml'],
    skin_type: 'oily',
    stock: 110,
    rating: 4.5,
    reviewCount: 87,
    featured: false,
    newArrival: false,
  },

  // Moisturizers
  {
    slug: 'daily-hydration-gel-cream',
    name: 'Daily Hydration Gel Cream',
    description: 'A weightless gel-cream moisturizer with squalane and panthenol. Absorbs in seconds, delivers 48-hour hydration, and leaves a natural, dewy finish — never greasy.',
    price: 44.0,
    compare_at_price: null,
    categorySlug: 'moisturizers',
    images: [
      'https://images.pexels.com/photos/36698525/pexels-photo-36698525.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/6690232/pexels-photo-6690232.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'all',
    stock: 140,
    rating: 4.7,
    reviewCount: 134,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'rich-barrier-cream',
    name: 'Rich Barrier Cream',
    description: 'A deeply nourishing cream with ceramides, shea butter, and peptides. Restores the moisture barrier overnight and leaves dry skin plump, smooth, and comfortable by morning.',
    price: 52.0,
    compare_at_price: null,
    categorySlug: 'moisturizers',
    images: [
      'https://images.pexels.com/photos/18350885/pexels-photo-18350885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/34544440/pexels-photo-34544440.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'dry',
    stock: 100,
    rating: 4.8,
    reviewCount: 91,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'oil-free-mattifying-moisturizer',
    name: 'Oil-Free Mattifying Moisturizer',
    description: 'A shine-control moisturizer with silica and green tea extract. Hydrates without adding oil, leaving a matte, velvety finish that lasts all day.',
    price: 38.0,
    compare_at_price: null,
    categorySlug: 'moisturizers',
    images: [
      'https://images.pexels.com/photos/7691162/pexels-photo-7691162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/7691159/pexels-photo-7691159.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'oily',
    stock: 85,
    rating: 4.4,
    reviewCount: 67,
    featured: false,
    newArrival: false,
  },
  {
    slug: 'overnight-recovery-cream',
    name: 'Overnight Recovery Cream',
    description: 'A restorative night cream with peptides, bakuchiol, and evening primrose oil. Works while you sleep to firm, smooth, and revive tired skin.',
    price: 62.0,
    compare_at_price: null,
    categorySlug: 'moisturizers',
    images: [
      'https://images.pexels.com/photos/28481891/pexels-photo-28481891.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/21283464/pexels-photo-21283464.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'all',
    stock: 75,
    rating: 4.6,
    reviewCount: 54,
    featured: false,
    newArrival: true,
  },

  // Sun Protection
  {
    slug: 'invisible-daily-spf-50',
    name: 'Invisible Daily SPF 50',
    description: 'A weightless, invisible sunscreen that disappears into all skin tones. Broad-spectrum SPF 50 with antioxidants — no white cast, no greasy residue, no pilling under makeup.',
    price: 38.0,
    compare_at_price: null,
    categorySlug: 'sun-protection',
    images: [
      'https://images.pexels.com/photos/8384509/pexels-photo-8384509.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/34823989/pexels-photo-34823989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'all',
    stock: 200,
    rating: 4.8,
    reviewCount: 187,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'mineral-spf-30-sheer',
    name: 'Mineral SPF 30 Sheer',
    description: 'A 100% mineral sunscreen with zinc oxide and niacinamide. Sheer tint blends seamlessly for a natural, even finish. Ideal for sensitive and reactive skin.',
    price: 42.0,
    compare_at_price: null,
    categorySlug: 'sun-protection',
    images: [
      'https://images.pexels.com/photos/13779259/pexels-photo-13779259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/13779260/pexels-photo-13779260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'sensitive',
    stock: 120,
    rating: 4.6,
    reviewCount: 78,
    featured: false,
    newArrival: false,
  },
  {
    slug: 'tinted-glow-spf-40',
    name: 'Tinted Glow SPF 40',
    description: 'A lightly tinted sunscreen that doubles as a primer. Gives skin a healthy, dewy glow while protecting against UVA/UVB and blue light. Wear it alone or under foundation.',
    price: 40.0,
    compare_at_price: 48.0,
    categorySlug: 'sun-protection',
    images: [
      'https://images.pexels.com/photos/11935638/pexels-photo-11935638.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/32110926/pexels-photo-32110926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'all',
    stock: 95,
    rating: 4.5,
    reviewCount: 62,
    featured: false,
    newArrival: false,
  },
  {
    slug: 'sport-resistant-spf-50',
    name: 'Sport Resistant SPF 50',
    description: 'A water-resistant, sweat-proof formula for active days. Lightweight, non-sticky, and reef-safe. Reapply every two hours for full protection outdoors.',
    price: 36.0,
    compare_at_price: null,
    categorySlug: 'sun-protection',
    images: [
      'https://images.pexels.com/photos/19466165/pexels-photo-19466165.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/16378485/pexels-photo-16378485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['100ml'],
    skin_type: 'all',
    stock: 80,
    rating: 4.4,
    reviewCount: 43,
    featured: false,
    newArrival: false,
  },

  // Masks & Treatments
  {
    slug: 'detox-clay-mask',
    name: 'Detox Clay Mask',
    description: 'A kaolin and bentonite clay mask that draws out impurities and absorbs excess oil without drying the skin. Added glycerin and aloe keep skin comfortable. Use 1-2 times weekly.',
    price: 36.0,
    compare_at_price: null,
    categorySlug: 'masks-treatments',
    images: [
      'https://images.pexels.com/photos/6925512/pexels-photo-6925512.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8076094/pexels-photo-8076094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['100ml'],
    skin_type: 'all',
    stock: 90,
    rating: 4.6,
    reviewCount: 76,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'overnight-glow-mask',
    name: 'Overnight Glow Mask',
    description: 'A leave-on overnight treatment with glycolic acid, glycerin, and rosehip oil. Exfoliates gently while you sleep — wake up to smoother, brighter, more radiant skin.',
    price: 48.0,
    compare_at_price: null,
    categorySlug: 'masks-treatments',
    images: [
      'https://images.pexels.com/photos/8260622/pexels-photo-8260622.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8406601/pexels-photo-8406601.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['50ml'],
    skin_type: 'all',
    stock: 70,
    rating: 4.7,
    reviewCount: 58,
    featured: false,
    newArrival: true,
  },
  {
    slug: 'bio-cellulose-sheet-mask',
    name: 'Bio-Cellulose Sheet Mask',
    description: 'A single-use bio-cellulose mask drenched in hyaluronic acid, peptides, and centella asiatica. Delivers an instant boost of hydration and calm in 20 minutes.',
    price: 12.0,
    compare_at_price: null,
    categorySlug: 'masks-treatments',
    images: [
      'https://images.pexels.com/photos/11179550/pexels-photo-11179550.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/6619517/pexels-photo-6619517.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['single'],
    skin_type: 'all',
    stock: 300,
    rating: 4.5,
    reviewCount: 112,
    featured: false,
    newArrival: false,
  },
  {
    slug: 'aha-bha-resurfacing-treatment',
    name: 'AHA-BHA Resurfacing Treatment',
    description: 'A liquid exfoliant with glycolic, lactic, and salicylic acids. Unclogs pores, smooths texture, and brightens tone. Use 2-3 times weekly for visibly renewed skin.',
    price: 54.0,
    compare_at_price: 64.0,
    categorySlug: 'masks-treatments',
    images: [
      'https://images.pexels.com/photos/4760309/pexels-photo-4760309.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/7479654/pexels-photo-7479654.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['100ml'],
    skin_type: 'all',
    stock: 60,
    rating: 4.6,
    reviewCount: 49,
    featured: false,
    newArrival: false,
  },

  // Lip & Eye Care
  {
    slug: 'brightening-eye-cream',
    name: 'Brightening Eye Cream',
    description: 'A peptide and caffeine eye cream that de-puffs, brightens dark circles, and smooths fine lines. Lightweight yet nourishing — layers beautifully under concealer.',
    price: 46.0,
    compare_at_price: null,
    categorySlug: 'lip-eye-care',
    images: [
      'https://images.pexels.com/photos/12053218/pexels-photo-12053218.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/16329592/pexels-photo-16329592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['15ml'],
    skin_type: 'all',
    stock: 110,
    rating: 4.7,
    reviewCount: 84,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'firming-eye-serum',
    name: 'Firming Eye Serum',
    description: 'A targeted eye serum with retinol, peptides, and vitamin K. Visibly firms the eye area and reduces the appearance of crow\'s feet over time. Gentle enough for nightly use.',
    price: 58.0,
    compare_at_price: null,
    categorySlug: 'lip-eye-care',
    images: [
      'https://images.pexels.com/photos/29611528/pexels-photo-29611528.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/18992757/pexels-photo-18992757.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['15ml'],
    skin_type: 'all',
    stock: 65,
    rating: 4.5,
    reviewCount: 41,
    featured: false,
    newArrival: true,
  },
  {
    slug: 'nourishing-lip-treatment',
    name: 'Nourishing Lip Treatment',
    description: 'A rich lip balm with shea butter, squalane, and vitamin E. Repairs dry, chapped lips overnight and leaves a subtle, non-sticky sheen. Wear day or night.',
    price: 18.0,
    compare_at_price: null,
    categorySlug: 'lip-eye-care',
    images: [
      'https://images.pexels.com/photos/26927323/pexels-photo-26927323.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/26927320/pexels-photo-26927320.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['4g'],
    skin_type: 'all',
    stock: 250,
    rating: 4.6,
    reviewCount: 96,
    featured: true,
    newArrival: false,
  },
  {
    slug: 'lip-renewal-scrub',
    name: 'Lip Renewal Scrub',
    description: 'A gentle sugar scrub that buffs away dry skin and preps lips for color or balm. Infused with jojoba oil and honey for a soft, smooth finish.',
    price: 16.0,
    compare_at_price: 20.0,
    categorySlug: 'lip-eye-care',
    images: [
      'https://images.pexels.com/photos/37661673/pexels-photo-37661673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/20382237/pexels-photo-20382237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    sizes: ['10g'],
    skin_type: 'all',
    stock: 180,
    rating: 4.4,
    reviewCount: 38,
    featured: false,
    newArrival: false,
  },
];

async function seed() {
  console.log('[Seed]: Starting database seeding...');
  let memServer = null;

  try {
    await connectDB();
  } catch (err) {
    console.log('[Seed]: Local MongoDB server unavailable, starting in-memory database instance for seed execution...');
    memServer = await MongoMemoryServer.create();
    await mongoose.connect(memServer.getUri());
    console.log('[Seed]: Connected to memory database.');
  }

  // Clear existing collections
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Promo.deleteMany({}),
  ]);

  // Insert categories
  const categories = await Category.insertMany(categoriesData);
  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.slug] = c;
  });
  console.log(`[Seed]: Created ${categories.length} categories.`);

  // Insert products
  const productsToInsert = productsData.map((p) => {
    const cat = categoryMap[p.categorySlug];
    return {
      ...p,
      category: cat ? cat._id : null,
      category_id: cat ? cat._id.toString() : null,
      variants: p.sizes.map((s) => ({
        size: s,
        price: p.price,
        stock: Math.floor(p.stock / p.sizes.length),
      })),
    };
  });
  const products = await Product.insertMany(productsToInsert);
  console.log(`[Seed]: Created ${products.length} products.`);

  // Create Users (Admin & Customer)
  const adminPasswordHash = await User.hashPassword(env.SEED_ADMIN_PASSWORD);
  const customerPasswordHash = await User.hashPassword('CustomerPassword123!');

  const admin = await User.create({
    name: 'LUMÉ Administrator',
    email: env.SEED_ADMIN_EMAIL.toLowerCase(),
    passwordHash: adminPasswordHash,
    role: 'admin',
    phone: '+1 (555) 019-2831',
  });

  const customer = await User.create({
    name: 'Jane Doe',
    email: 'customer@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    phone: '+1 (555) 123-4567',
    addresses: [
      {
        full_name: 'Jane Doe',
        address_line1: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postal_code: '97477',
        country: 'United States',
        phone: '+1 (555) 123-4567',
        isDefault: true,
      },
    ],
  });

  console.log(`[Seed]: Created admin account: ${admin.email}`);
  console.log(`[Seed]: Created customer account: ${customer.email}`);

  // Create Promos
  await Promo.insertMany([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true },
    { code: 'LUME15', discountType: 'percentage', discountValue: 15, isActive: true },
    { code: 'GLOW20', discountType: 'percentage', discountValue: 20, isActive: true },
  ]);
  console.log('[Seed]: Created promo codes WELCOME10, LUME15, GLOW20.');

  // Create Sample Reviews
  const firstProd = products[0];
  const secondProd = products[4]; // Vitamin C serum

  await Review.create({
    product: firstProd._id,
    user: customer._id,
    user_name: 'Jane Doe',
    rating: 5,
    title: 'Leaves skin feeling so clean!',
    body: 'This cleanser is so gentle on my sensitive skin. Does not leave any tight or dry feeling afterwards.',
    verifiedPurchase: true,
  });

  await Review.create({
    product: secondProd._id,
    user: customer._id,
    user_name: 'Jane Doe',
    rating: 5,
    title: 'My morning staple',
    body: 'Visibly lightened my hyperpigmentation within 3 weeks of daily use. Smells subtle and absorbs fast.',
    verifiedPurchase: true,
  });

  console.log('[Seed]: Created sample reviews.');

  // Create Sample Orders
  await Order.create({
    user: customer._id,
    user_id: customer._id.toString(),
    email: customer.email,
    items: [
      {
        product_id: firstProd._id.toString(),
        name: firstProd.name,
        price: firstProd.price,
        qty: 1,
        image: firstProd.images[0],
        size: firstProd.sizes[0] || '150ml',
      },
      {
        product_id: secondProd._id.toString(),
        name: secondProd.name,
        price: secondProd.price,
        qty: 1,
        image: secondProd.images[0],
        size: secondProd.sizes[0] || '30ml',
      },
    ],
    shippingAddress: customer.addresses[0],
    subtotal: firstProd.price + secondProd.price,
    discount: 8.6,
    shipping: 0,
    tax: 6.2,
    total: firstProd.price + secondProd.price - 8.6 + 6.2,
    promoCode: 'WELCOME10',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
  });

  console.log('[Seed]: Created sample customer order.');

  await disconnectDB();
  if (memServer) await memServer.stop();
  console.log('[Seed]: Database seeding completed successfully!');
}

seed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
