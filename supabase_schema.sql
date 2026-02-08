-- Daddy Dashboard Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👶',
  theme_color TEXT DEFAULT 'blue',
  dob DATE,
  google_email TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Year Groups table
CREATE TABLE IF NOT EXISTS year_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year_group_id UUID REFERENCES year_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 45,
  outcomes JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  deleted BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access their own data
CREATE POLICY "Users can manage their own children" ON children
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own year groups" ON year_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own subjects" ON subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM year_groups 
      JOIN children ON year_groups.child_id = children.id 
      WHERE year_groups.id = subjects.year_group_id AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects 
      JOIN year_groups ON subjects.year_group_id = year_groups.id
      JOIN children ON year_groups.child_id = children.id
      WHERE subjects.id = lessons.subject_id AND children.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_year_groups_child_id ON year_groups(child_id);
CREATE INDEX idx_subjects_year_group_id ON subjects(year_group_id);
CREATE INDEX idx_lessons_subject_id ON lessons(subject_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to seed initial data (for testing)
CREATE OR REPLACE FUNCTION seed_sample_data()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  INSERT INTO children (id, user_id, name, avatar, theme_color, order_index)
  VALUES 
    ('adrian', current_user_id, 'Adrian', '🧑‍🚀', 'indigo', 0),
    ('sophia', current_user_id, 'Sophia', '👩‍🎨', 'rose', 1)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO year_groups (id, child_id, name, order_index)
  VALUES 
    ('adrian-y9', 'adrian', 'Year 9', 0),
    ('adrian-y10', 'adrian', 'Year 10', 1),
    ('sophia-y5', 'sophia', 'Year 5', 0),
    ('sophia-y6', 'sophia', 'Year 6', 1)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO subjects (id, year_group_id, name, category, color)
  VALUES 
    ('a9-eng', 'adrian-y9', 'English: Writing Narratives', 'English', 'bg-amber-100 text-amber-800'),
    ('a9-math', 'adrian-y9', 'Maths: Number Operations', 'Maths', 'bg-blue-100 text-blue-800'),
    ('a10-sci', 'adrian-y10', 'Science: Biology', 'Science', 'bg-green-100 text-green-800'),
    ('s5-math', 'sophia-y5', 'Maths: Shape & Measure', 'Maths', 'bg-blue-100 text-blue-800'),
    ('s5-sci', 'sophia-y5', 'Science: Living Things', 'Science', 'bg-emerald-100 text-emerald-800'),
    ('s6-eng', 'sophia-y6', 'English: Persuasive Writing', 'English', 'bg-amber-100 text-amber-800')
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
