/*
  # Create Resume Templates Table

  1. New Tables
    - `resume_templates`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `thumbnail_url` (text)
      - `content` (jsonb)
      - `is_premium` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `resume_templates` table
    - Add policy for authenticated users to read templates
    - Add policy for admins to manage templates
*/

-- Create resume templates table
CREATE TABLE IF NOT EXISTS resume_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  thumbnail_url text,
  content jsonb NOT NULL,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read templates"
  ON resume_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can modify templates"
  ON resume_templates
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_resume_templates_updated_at
  BEFORE UPDATE ON resume_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();