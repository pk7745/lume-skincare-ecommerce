import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  compare_at_price: z.number().nullable().optional(),
  category: z.string().optional(),
  category_id: z.string().optional(),
  images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least one image is required'),
  sizes: z.array(z.string()).default([]),
  variants: z
    .array(
      z.object({
        size: z.string(),
        color: z.string().optional(),
        sku: z.string().optional(),
        price: z.number().optional(),
        stock: z.number().min(0).default(0),
      })
    )
    .optional(),
  skin_type: z.string().default('all'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  sort_order: z.number().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  size: z.string().min(1, 'Size is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const cartUpdateQtySchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  size: z.string().optional(),
});

export const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  address_line1: z.string().min(3, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(2, 'Postal code is required'),
  country: z.string().default('United States'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().optional(),
  body: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  body: z.string().min(5).optional(),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string(),
        price: z.number().positive(),
        qty: z.number().int().min(1),
        image: z.string(),
        size: z.string(),
      })
    )
    .min(1, 'Order must contain at least one item'),
  shipping_address: addressSchema,
  promoCode: z.string().optional(),
});

export const promoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
});
