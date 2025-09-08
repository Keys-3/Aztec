/*
  # Create Orders and Cart System

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `price` (numeric)
      - `stock` (integer)
      - `image_url` (text)
      - `description` (text)
      - `harvest_date` (date)
      - `quality` (text)
      - `rating` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total_amount` (numeric)
      - `status` (text)
      - `shipping_address` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  description text,
  harvest_date date,
  quality text DEFAULT 'Premium',
  rating numeric DEFAULT 4.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Insert sample products
INSERT INTO products (name, category, price, stock, image_url, description, harvest_date, quality, rating) VALUES
('Organic Lettuce', 'leafy-greens', 399, 25, 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg', 'Fresh, crisp lettuce grown in our state-of-the-art hydroponic system.', '2025-01-10', 'Premium', 4.9),
('Cherry Tomatoes', 'fruits', 559, 18, 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', 'Sweet, vine-ripened cherry tomatoes packed with flavor and nutrients.', '2025-01-08', 'Premium', 4.8),
('Fresh Basil', 'herbs', 279, 32, 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg', 'Aromatic basil leaves perfect for cooking and garnishing.', '2025-01-12', 'Premium', 4.9),
('Baby Spinach', 'leafy-greens', 439, 22, 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg', 'Tender baby spinach leaves rich in iron and vitamins.', '2025-01-09', 'Premium', 4.7),
('Mixed Herbs Bundle', 'herbs', 719, 15, 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg', 'Variety pack including basil, cilantro, parsley, and mint.', '2025-01-11', 'Premium', 4.8),
('Cucumber', 'fruits', 239, 28, 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg', 'Crisp, refreshing cucumbers perfect for salads and snacking.', '2025-01-13', 'Premium', 4.6),
('Kale', 'leafy-greens', 359, 20, 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg', 'Nutrient-dense kale leaves perfect for smoothies and salads.', '2025-01-14', 'Premium', 4.7),
('Bell Peppers', 'fruits', 459, 16, 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', 'Colorful bell peppers with sweet, crisp texture.', '2025-01-15', 'Premium', 4.8);

-- Add updated_at trigger for products
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();