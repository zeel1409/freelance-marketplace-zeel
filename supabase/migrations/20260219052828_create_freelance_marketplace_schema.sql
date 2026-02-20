/*
  # Freelance Marketplace Schema

  ## Overview
  Creates the complete database schema for a freelance marketplace platform similar to Fiverr.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `role` (text) - 'client' or 'freelancer'
  - `avatar_url` (text, nullable)
  - `bio` (text, nullable)
  - `skills` (text[], nullable) - array of skills for freelancers
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `gigs`
  - `id` (uuid, primary key)
  - `freelancer_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `category` (text)
  - `price` (integer) - price in cents
  - `delivery_days` (integer)
  - `image_url` (text, nullable)
  - `status` (text) - 'active' or 'inactive'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `orders`
  - `id` (uuid, primary key)
  - `gig_id` (uuid, references gigs)
  - `client_id` (uuid, references profiles)
  - `freelancer_id` (uuid, references profiles)
  - `status` (text) - 'pending', 'in_progress', 'delivered', 'completed', 'cancelled'
  - `price` (integer) - price in cents
  - `requirements` (text, nullable)
  - `delivery_date` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `messages`
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `sender_id` (uuid, references profiles)
  - `receiver_id` (uuid, references profiles)
  - `content` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ### `reviews`
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `gig_id` (uuid, references gigs)
  - `client_id` (uuid, references profiles)
  - `freelancer_id` (uuid, references profiles)
  - `rating` (integer) - 1 to 5
  - `comment` (text, nullable)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their own data
  - Public read access for gigs and reviews
  - Order and message access restricted to participants
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'freelancer')),
  avatar_url text,
  bio text,
  skills text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gigs table
CREATE TABLE IF NOT EXISTS gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  delivery_days integer NOT NULL CHECK (delivery_days > 0),
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'completed', 'cancelled')),
  price integer NOT NULL,
  requirements text,
  delivery_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gig_id uuid NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Gigs policies
CREATE POLICY "Gigs are viewable by everyone"
  ON gigs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Freelancers can insert their own gigs"
  ON gigs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = freelancer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'freelancer')
  );

CREATE POLICY "Freelancers can update their own gigs"
  ON gigs FOR UPDATE
  TO authenticated
  USING (auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can delete their own gigs"
  ON gigs FOR DELETE
  TO authenticated
  USING (auth.uid() = freelancer_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Clients can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Order participants can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages for their orders"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND (client_id = auth.uid() OR freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create reviews for completed orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id 
      AND client_id = auth.uid() 
      AND status = 'completed'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gigs_freelancer ON gigs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer ON orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_orders_gig ON orders(gig_id);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_gig ON reviews(gig_id);
CREATE INDEX IF NOT EXISTS idx_reviews_freelancer ON reviews(freelancer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON gigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();