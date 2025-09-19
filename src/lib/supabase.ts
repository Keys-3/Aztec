import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session management utilities
export const generateSessionToken = () => {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
};

export const getSessionExpiry = (rememberMe: boolean) => {
  const now = new Date();
  if (rememberMe) {
    // 30 days for remembered sessions
    now.setDate(now.getDate() + 30);
  } else {
    // 24 hours for regular sessions
    now.setHours(now.getHours() + 24);
  }
  return now.toISOString();
};

export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
};
export type User = {
  id: string;
  email: string;
  username: string;
  contact: string;
  created_at: string;
};

export type AuthSession = {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  remember_me: boolean;
  device_info: any;
  last_activity: string;
  created_at: string;
  updated_at: string;
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
export type UserInventory = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
};

export type ShopListing = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  product?: Product;
};

// Inventory management functions
export const getUserInventory = async (userId: string): Promise<UserInventory[]> => {
  const { data, error } = await supabase
    .from('user_inventory')
    .select(`
      *,
      product:products (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user inventory:', error);
    return [];
  }

  return data || [];
};

export const updateInventoryQuantity = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
  const { error } = await supabase
    .from('user_inventory')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity: Math.max(0, quantity)
    }, {
      onConflict: 'user_id,product_id'
    });

  if (error) {
    console.error('Error updating inventory quantity:', error);
    return false;
  }

  return true;
};

export const getUserShopListings = async (userId: string): Promise<ShopListing[]> => {
  const { data, error } = await supabase
    .from('shop_listings')
    .select(`
      *,
      product:products (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shop listings:', error);
    return [];
  }

  return data || [];
};

export const getAllShopListings = async (): Promise<ShopListing[]> => {
  const { data, error } = await supabase
    .from('shop_listings')
    .select(`
      *,
      product:products (*),
      user_profiles!shop_listings_user_id_fkey (username)
    `)
    .eq('status', 'active')
    .gt('quantity', 0)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all shop listings:', error);
    return [];
  }

  return data || [];
};

export const createShopListing = async (userId: string, productId: string, quantity: number, price: number): Promise<boolean> => {
  const { error } = await supabase
    .from('shop_listings')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity,
      price,
      status: 'active'
    }, {
      onConflict: 'user_id,product_id'
    });

  if (error) {
    console.error('Error creating shop listing:', error);
    return false;
  }

  return true;
};

export const removeShopListing = async (userId: string, productId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('shop_listings')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing shop listing:', error);
    return false;
  }

  return true;
};

export const updateShopListingQuantity = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
  if (quantity <= 0) {
    return removeShopListing(userId, productId);
  }

  const { error } = await supabase
    .from('shop_listings')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error updating shop listing quantity:', error);
    return false;
  }

  return true;
};