/*
  # Create events and registrations tables

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `location` (text)
      - `type` (text) - 'in_person', 'online', 'hybrid'
      - `max_attendees` (int)
      - `needs_volunteers` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `registration_type` (text) - 'attendee', 'volunteer'
      - `created_at` (timestamptz)
      - `status` (text) - 'pending', 'confirmed', 'cancelled'

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and registering for events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('in_person', 'online', 'hybrid')),
  max_attendees int,
  needs_volunteers boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  registration_type text NOT NULL CHECK (registration_type IN ('attendee', 'volunteer')),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Events are viewable by all users"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for event registrations
CREATE POLICY "Users can view their own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);