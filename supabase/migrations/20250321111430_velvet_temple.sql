/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `full_name` (text)
      - `role` (enum: member, pastor, minister, admin)
      - `avatar_url` (text, nullable)
      - `phone` (text, nullable)

    - `prayer_requests`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `status` (enum: pending, in_progress, completed)
      - `is_anonymous` (boolean)
      - `user_id` (uuid, references profiles)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'pastor', 'minister', 'admin')),
  avatar_url text,
  phone text
);

-- Create prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  is_anonymous boolean DEFAULT false,
  user_id uuid REFERENCES profiles(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Prayer requests policies
CREATE POLICY "Anyone can view non-anonymous prayer requests"
  ON prayer_requests
  FOR SELECT
  TO authenticated
  USING (NOT is_anonymous OR auth.uid() = user_id);

CREATE POLICY "Users can create prayer requests"
  ON prayer_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer requests"
  ON prayer_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();