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
  name TEXT NOT NULL, -- Subject (English, Maths, Science)
  category TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- Topic (Reading Comprehension, Algebra)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
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
      JOIN children ON year_groups.id = subjects.year_group_id 
      WHERE year_groups.id = subjects.year_group_id AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own topics" ON topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects 
      JOIN year_groups ON subjects.year_group_id = year_groups.id
      JOIN children ON year_groups.child_id = children.id
      WHERE subjects.id = topics.subject_id AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM topics 
      JOIN subjects ON topics.subject_id = subjects.id
      JOIN year_groups ON subjects.year_group_id = year_groups.id
      JOIN children ON year_groups.child_id = children.id
      WHERE topics.id = lessons.topic_id AND children.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_year_groups_child_id ON year_groups(child_id);
CREATE INDEX idx_subjects_year_group_id ON subjects(year_group_id);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);
