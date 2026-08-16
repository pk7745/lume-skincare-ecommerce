export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  category?: { name: string; slug: string } | null;
  images: string[];
  sizes: string[];
  skin_type: string;
  stock: number;
  rating: number;
  review_count: number;
  featured: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  email: string;
  created_at: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  size: string;
};

export type ShippingAddress = {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
};

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
  stock: number;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
};

export type ProductWithCategory = Product & {
  categories?: Pick<Category, 'name' | 'slug'>;
};
