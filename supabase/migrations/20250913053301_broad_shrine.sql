/*
  # Create inventory and shop system

  1. New Tables
    - `user_inventory`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `shop_listings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `price` (numeric)
      - `status` (text, default 'active')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own inventory and listings

  3. Sample Data
    - Insert initial inventory data for existing users
*/

-- Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create shop_listings table
CREATE TABLE IF NOT EXISTS shop_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_inventory
CREATE POLICY "Users can manage own inventory"
  ON user_inventory
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for shop_listings
CREATE POLICY "Users can manage own shop listings"
  ON shop_listings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read active shop listings"
  ON shop_listings
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Add updated_at triggers
CREATE TRIGGER handle_user_inventory_updated_at
  BEFORE UPDATE ON user_inventory
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_shop_listings_updated_at
  BEFORE UPDATE ON shop_listings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert sample inventory data for all users
DO $$
DECLARE
  user_record RECORD;
  product_record RECORD;
BEGIN
  -- Loop through all users and products to create initial inventory
  FOR user_record IN SELECT id FROM user_profiles LOOP
    FOR product_record IN SELECT id FROM products LOOP
      INSERT INTO user_inventory (user_id, product_id, quantity)
      VALUES (
        user_record.id,
        product_record.id,
        FLOOR(RANDOM() * 30) + 10  -- Random quantity between 10-40
      )
      ON CONFLICT (user_id, product_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;