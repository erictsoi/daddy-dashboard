-- Daddy Dashboard Database Schema (Performance Optimized v4.0)
-- Run this SQL in your Supabase SQL Editor

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
  google_email TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Year Groups table (e.g., Year 5, Year 9)
-- Uses deterministic TEXT ID for easy lookup without joins
CREATE TABLE IF NOT EXISTS year_groups (
  id TEXT PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table (e.g., English, Maths, Science)
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  year_group_id TEXT REFERENCES year_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  color TEXT DEFAULT 'gray',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table (e.g., Writing Narratives, Fractions)
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
-- Uses UUID for individual lesson tracking
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  duration_minutes INTEGER,
  outcomes JSONB DEFAULT '[]'::jsonb,
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

-- PERFORMANCE INDEXES

-- Primary lookup indexes (high-frequency queries)
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_user_order ON children(user_id, order_index);

-- Year groups indexes
CREATE INDEX IF NOT EXISTS idx_year_groups_child_id ON year_groups(child_id);
CREATE INDEX IF NOT EXISTS idx_year_groups_child_order ON year_groups(child_id, order_index);

-- Subjects indexes
CREATE INDEX IF NOT EXISTS idx_subjects_year_group_id ON subjects(year_group_id);
CREATE INDEX IF NOT EXISTS idx_subjects_year_group_order ON subjects(year_group_id, order_index);
CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects(category);

-- Topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject_order ON topics(subject_id, order_index);

-- Lessons indexes (most important for performance)
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_order ON lessons(topic_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_completed ON lessons(topic_id, completed);
CREATE INDEX IF NOT EXISTS idx_lessons_not_deleted ON lessons(topic_id, deleted) WHERE deleted = FALSE;

-- Composite index for dashboard queries (child progress)
CREATE INDEX IF NOT EXISTS idx_lessons_child_progress ON lessons(
  topic_id,
  completed,
  deleted
) WHERE deleted = FALSE;

-- Video URL lookup index (for deduplication)
CREATE INDEX IF NOT EXISTS idx_lessons_video_url ON lessons(video_url) WHERE video_url IS NOT NULL;

-- Full-text search index on lesson titles (future feature)
CREATE INDEX IF NOT EXISTS idx_lessons_title_gin ON lessons USING gin(to_tsvector('english', title));

-- Enable Row Level Security (RLS)
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can manage their own children" ON children
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own year groups" ON year_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own topics" ON topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM subjects WHERE id = topics.subject_id)
    AND EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM topics WHERE id = lessons.topic_id)
    AND EXISTS (SELECT 1 FROM subjects WHERE id = topics.subject_id)
    AND EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_year_groups_updated_at BEFORE UPDATE ON year_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper view for child curriculum overview (performance optimization)
CREATE OR REPLACE VIEW child_curriculum AS
SELECT
  c.id AS child_id,
  c.name AS child_name,
  c.avatar,
  c.theme_color,
  yg.id AS year_group_id,
  yg.name AS year_group_name,
  s.id AS subject_id,
  s.name AS subject_name,
  s.category,
  s.color,
  t.id AS topic_id,
  t.name AS topic_name,
  COUNT(l.id) FILTER (WHERE l.deleted = FALSE) AS total_lessons,
  COUNT(l.id) FILTER (WHERE l.completed = TRUE AND l.deleted = FALSE) AS completed_lessons,
  COALESCE(SUM(l.time_spent_seconds) FILTER (WHERE l.deleted = FALSE), 0) AS total_time_seconds
FROM children c
JOIN year_groups yg ON yg.child_id = c.id
JOIN subjects s ON s.year_group_id = yg.id
JOIN topics t ON t.subject_id = s.id
LEFT JOIN lessons l ON l.topic_id = t.id
GROUP BY c.id, c.name, c.avatar, c.theme_color, yg.id, yg.name, s.id, s.name, s.category, s.color, t.id, t.name;
