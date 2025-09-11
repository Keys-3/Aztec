/*
  # Create authentication sessions table

  1. New Tables
    - `auth_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `session_token` (text, unique)
      - `expires_at` (timestamp)
      - `remember_me` (boolean)
      - `device_info` (jsonb, optional)
      - `last_activity` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `auth_sessions` table
    - Add policies for users to manage their own sessions
    - Add automatic cleanup of expired sessions

  3. Indexes
    - Index on session_token for fast lookups
    - Index on user_id for user session queries
    - Index on expires_at for cleanup operations
*/

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  remember_me boolean DEFAULT false,
  device_info jsonb DEFAULT '{}',
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own sessions"
  ON auth_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own sessions"
  ON auth_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own sessions"
  ON auth_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own sessions"
  ON auth_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_activity ON auth_sessions(last_activity);

-- Create updated_at trigger
CREATE TRIGGER handle_auth_sessions_updated_at
  BEFORE UPDATE ON auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth_sessions 
  WHERE expires_at < now();
END;
$$;

-- Create a scheduled cleanup (this would typically be done via pg_cron or external scheduler)
-- For now, we'll rely on application-level cleanup