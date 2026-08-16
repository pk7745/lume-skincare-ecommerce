import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Promo } from '../models/Promo.js';
import { env } from '../config/env.js';

const categoriesData = [
  { name: 'Cleansers', slug: 'cleansers', description: 'Gentle yet effective formulas to remove impurities while respecting your skin barrier.', sort_order: 1 },
  { name: 'Serums', slug: 'serums', description: 'Concentrated actives that target specific concerns — from brightness to firmness.', sort_order: 2 },
  { name: 'Moisturizers', slug: 'moisturizers', description: 'Lock in hydration with lightweight gels and rich creams for every skin type.', sort_order: 3 },
  { name: 'Sun Protection', slug: 'sun-protection', description: 'Daily SPF that protects without the white cast. Non-negotiable for healthy skin.', sort_order: 4 },
  { name: 'Masks & Treatments', slug: 'masks-treatments', description: 'Weekly rituals for an instant boost — clay, sheet, and overnight treatments.', sort_order: 5 },
  { name: 'Lip & Eye Care', slug: 'lip-eye-care', description: 'Targeted care for delicate areas. Smooth, brighten, and protect.', sort_order: 6 },
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
  },
  // Sun protection
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
  },
  // Masks
  {
    slug: 'detox-clay-mask',
    name: 'Detox Clay Mask',
    description: 'A kaolin and bentonite clay mask that draws out impurities and absorbs excess oil without drying the skin. Added glycerin and aloe keep skin comfortable.',
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
  },
  // Lip & Eye
  {
    slug: 'brightening-eye-cream',
    name: 'Brightening Eye Cream',
    description: 'A peptide and caffeine eye cream that de-puffs, brightens dark circles, and smooths fine lines.',
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
  },
  {
    slug: 'nourishing-lip-treatment',
    name: 'Nourishing Lip Treatment',
    description: 'A rich lip balm with shea butter, squalane, and vitamin E. Repairs dry lips overnight.',
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
  },
];

export async function seedDatabase() {
  const existingCount = await Product.countDocuments();
  if (existingCount > 0) return;

  const categories = await Category.insertMany(categoriesData);
  const categoryMap = {};
  categories.forEach((c) => (categoryMap[c.slug] = c));

  const productsToInsert = productsData.map((p) => {
    const cat = categoryMap[p.categorySlug];
    return {
      ...p,
      category: cat ? cat._id : null,
      category_id: cat ? cat._id.toString() : null,
      variants: p.sizes.map((s) => ({ size: s, price: p.price, stock: Math.floor(p.stock / p.sizes.length) })),
    };
  });
  const products = await Product.insertMany(productsToInsert);

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

  await Promo.insertMany([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true },
    { code: 'LUME15', discountType: 'percentage', discountValue: 15, isActive: true },
    { code: 'GLOW20', discountType: 'percentage', discountValue: 20, isActive: true },
  ]);

  if (products[0] && customer) {
    await Review.create({
      product: products[0]._id,
      user: customer._id,
      user_name: 'Jane Doe',
      rating: 5,
      title: 'Leaves skin feeling so clean!',
      body: 'This cleanser is so gentle on my sensitive skin. Does not leave any tight or dry feeling afterwards.',
      verifiedPurchase: true,
    });
  }

  console.log('[SeedRunner]: Auto-seeded catalog and admin account successfully.');
}
