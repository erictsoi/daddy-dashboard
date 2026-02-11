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

-- Year Groups table (with denormalized user_id for RLS)
CREATE TABLE IF NOT EXISTS year_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table (with denormalized user_id for RLS)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year_group_id UUID REFERENCES year_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- Subject (English, Maths, Science)
  category TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table (with denormalized user_id for RLS)
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- Topic (Reading Comprehension, Algebra)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table (with denormalized user_id for RLS)
CREATE TABLE IF NOT EXISTS lessons (
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

-- Triggers to auto-populate user_id from parent records
CREATE OR REPLACE FUNCTION set_year_group_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = (SELECT user_id FROM children WHERE id = NEW.child_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS year_group_user_id_trigger ON year_groups;
CREATE TRIGGER year_group_user_id_trigger
  BEFORE INSERT ON year_groups
  FOR EACH ROW
  EXECUTE FUNCTION set_year_group_user_id();

CREATE OR REPLACE FUNCTION set_subject_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = (SELECT user_id FROM year_groups WHERE id = NEW.year_group_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subject_user_id_trigger ON subjects;
CREATE TRIGGER subject_user_id_trigger
  BEFORE INSERT ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION set_subject_user_id();

CREATE OR REPLACE FUNCTION set_topic_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = (SELECT user_id FROM subjects WHERE id = NEW.subject_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS topic_user_id_trigger ON topics;
CREATE TRIGGER topic_user_id_trigger
  BEFORE INSERT ON topics
  FOR EACH ROW
  EXECUTE FUNCTION set_topic_user_id();

CREATE OR REPLACE FUNCTION set_lesson_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = (SELECT user_id FROM topics WHERE id = NEW.topic_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lesson_user_id_trigger ON lessons;
CREATE TRIGGER lesson_user_id_trigger
  BEFORE INSERT ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION set_lesson_user_id();

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

-- Migration: Add user_id to existing records
UPDATE year_groups SET user_id = children.user_id
FROM children WHERE year_groups.child_id = children.id;

UPDATE subjects SET user_id = year_groups.user_id
FROM year_groups WHERE subjects.year_group_id = year_groups.id;

UPDATE topics SET user_id = subjects.user_id
FROM subjects WHERE topics.subject_id = subjects.id;

UPDATE lessons SET user_id = topics.user_id
FROM topics WHERE lessons.topic_id = topics.id;
