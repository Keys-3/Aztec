import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  username: string;
  contact: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description: string;
  harvest_date: string;
  quality: string;
  rating: number;
  created_at: string;
  updated_at: string;
  forSale?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};