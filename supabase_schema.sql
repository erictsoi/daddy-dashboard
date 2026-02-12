-- Daddy Dashboard Database Schema (Simplified v3.0)
-- Run this SQL in your Supabase SQL Editor
--
-- DATA HIERARCHY: Child -> YearGroup -> Subject -> Topic -> Lesson
-- ID STRATEGY: Children = UUID, Others = Deterministic (no duplicates)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Children table
-- Uses UUID for unique identification
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👶',
  theme_color TEXT DEFAULT 'blue',
  dob DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Year Groups table (e.g., Year 5, Year 9)
-- ID format: {child_id}-{yearName} (deterministic, unique per child)
CREATE TABLE IF NOT EXISTS year_groups (
  id TEXT PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,  -- e.g., "Year 5"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table (e.g., English, Maths, Science)
-- ID format: {yearGroup_id}-{subjectName} (deterministic, unique per year group)
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  year_group_id TEXT REFERENCES year_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,  -- e.g., "English"
  category TEXT,       -- "English", "Maths", "Science", etc.
  color TEXT DEFAULT 'bg-gray-100 text-gray-800',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table (e.g., Writing Narratives, Fractions)
-- ID format: {subject_id}-{topicName} (deterministic, unique per subject)
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,  -- e.g., "Writing Narratives"
  frequency INTEGER DEFAULT 3,  -- 1-5, frequency multiplier for scheduling
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
-- Uses UUID for individual lesson tracking
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Children: Users can only access their own children's data
CREATE POLICY "Users can manage their own children" ON children
  FOR ALL USING (auth.uid() = user_id);

-- Year Groups: Users can only access year groups belonging to their children
CREATE POLICY "Users can manage their own year groups" ON year_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

-- Subjects: Users can only access subjects belonging to their year groups
CREATE POLICY "Users can manage their own subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

-- Topics: Users can only access topics belonging to their subjects
CREATE POLICY "Users can manage their own topics" ON topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM subjects WHERE id = topics.subject_id)
    AND EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

-- Lessons: Users can only access lessons belonging to their topics
CREATE POLICY "Users can manage their own lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM topics WHERE id = lessons.topic_id)
    AND EXISTS (SELECT 1 FROM subjects WHERE id = topics.subject_id)
    AND EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_year_groups_child_id ON year_groups(child_id);
CREATE INDEX idx_subjects_year_group_id ON subjects(year_group_id);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX idx_lessons_completed ON lessons(topic_id, completed);

-- Seed function for testing
-- Run: SELECT seed_dummy_data('user-uuid-here');
CREATE OR REPLACE FUNCTION seed_dummy_data(user_id UUID)
RETURNS void AS $$
DECLARE
  child1_id UUID;
  child2_id UUID;
  yg1_id TEXT;
  yg2_id TEXT;
  subj1_id TEXT;
  subj2_id TEXT;
  topic1_id TEXT;
BEGIN
  -- Create two children
  INSERT INTO children (id, user_id, name, avatar, theme_color)
  VALUES (gen_random_uuid(), user_id, 'Adrian', '👦', 'indigo')
  RETURNING id INTO child1_id;

  INSERT INTO children (id, user_id, name, avatar, theme_color)
  VALUES (gen_random_uuid(), user_id, 'Sophia', '👧', 'rose')
  RETURNING id INTO child2_id;

  -- Year Groups
  INSERT INTO year_groups (id, child_id, name)
  VALUES (child1_id || '-Year-9', child1_id, 'Year 9')
  RETURNING id INTO yg1_id;

  INSERT INTO year_groups (id, child_id, name)
  VALUES (child2_id || '-Year-5', child2_id, 'Year 5')
  RETURNING id INTO yg2_id;

  -- Subjects
  INSERT INTO subjects (id, year_group_id, name, category, color)
  VALUES (yg1_id || '-English', yg1_id, 'English: Writing Narratives', 'English', 'bg-indigo-100 text-indigo-800')
  RETURNING id INTO subj1_id;

  INSERT INTO subjects (id, year_group_id, name, category, color)
  VALUES (yg2_id || '-Maths', yg2_id, 'Maths', 'Maths', 'bg-emerald-100 text-emerald-800')
  RETURNING id INTO subj2_id;

  -- Topics
  INSERT INTO topics (id, subject_id, name)
  VALUES (subj1_id || '-Hook-Openers', subj1_id, 'Hook Openers')
  RETURNING id INTO topic1_id;

  INSERT INTO topics (id, subject_id, name)
  VALUES (subj2_id || '-Fractions', subj2_id, 'Fractions')
  RETURNING id INTO topic1_id;

  -- Sample Lessons
  INSERT INTO lessons (topic_id, title, video_url, order_index)
  VALUES (topic1_id, 'How to Write a Hook', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1);

  INSERT INTO lessons (topic_id, title, video_url, order_index)
  VALUES (topic1_id, 'Examples of Great Hooks', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
END;
$$ LANGUAGE plpgsql;
