-- Nuclear option: Drop everything and recreate from scratch
-- WARNING: This will DELETE ALL DATA permanently!

-- Step 1: Drop all triggers first
DROP TRIGGER IF EXISTS year_group_user_id_trigger ON year_groups;
DROP TRIGGER IF EXISTS subject_user_id_trigger ON subjects;
DROP TRIGGER IF EXISTS topic_user_id_trigger ON topics;
DROP TRIGGER IF EXISTS lesson_user_id_trigger ON lessons;

-- Step 2: Drop all trigger functions
DROP FUNCTION IF EXISTS set_year_group_user_id();
DROP FUNCTION IF EXISTS set_subject_user_id();
DROP FUNCTION IF EXISTS set_topic_user_id();
DROP FUNCTION IF EXISTS set_lesson_user_id();

-- Step 3: Drop all policies
DROP POLICY IF EXISTS "Users can manage their own children" ON children;
DROP POLICY IF EXISTS "Users can manage their own year groups" ON year_groups;
DROP POLICY IF EXISTS "Users can manage their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can manage their own topics" ON topics;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON lessons;

-- Step 4: Drop all indexes
DROP INDEX IF EXISTS idx_children_user_id;
DROP INDEX IF EXISTS idx_year_groups_user_id;
DROP INDEX IF EXISTS idx_year_groups_child_id;
DROP INDEX IF EXISTS idx_subjects_user_id;
DROP INDEX IF EXISTS idx_subjects_year_group_id;
DROP INDEX IF EXISTS idx_topics_user_id;
DROP INDEX IF EXISTS idx_topics_subject_id;
DROP INDEX IF EXISTS idx_lessons_user_id;
DROP INDEX IF EXISTS idx_lessons_topic_id;

-- Step 5: Drop all tables (child tables first due to foreign keys)
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS year_groups CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 6: Recreate everything from scratch
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
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

-- Year Groups table (with denormalized user_id for RLS)
CREATE TABLE year_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table (with denormalized user_id for RLS)
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year_group_id UUID REFERENCES year_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table (with denormalized user_id for RLS)
CREATE TABLE topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table (with denormalized user_id for RLS)
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 45,
  outcomes JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  deleted BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  lesson_focus TEXT,
  lesson_notes TEXT,
  video_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies - simple and fast using denormalized user_id
CREATE POLICY "Users can manage their own children" ON children
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own year groups" ON year_groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own topics" ON topics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lessons" ON lessons
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_year_groups_user_id ON year_groups(user_id);
CREATE INDEX idx_year_groups_child_id ON year_groups(child_id);
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_year_group_id ON subjects(year_group_id);
CREATE INDEX idx_topics_user_id ON topics(user_id);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);

-- Verify setup
SELECT 'Setup complete!' as status;
SELECT 'children' as table_name, COUNT(*) as row_count FROM children
UNION ALL
SELECT 'year_groups', COUNT(*) FROM year_groups
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'topics', COUNT(*) FROM topics
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons;
