-- Complete migration script for RLS fix
-- Run this in your Supabase SQL Editor

-- Step 1: Add user_id columns (allow NULL initially)
ALTER TABLE year_groups ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Migrate existing data from parent tables
UPDATE year_groups SET user_id = children.user_id
FROM children WHERE year_groups.child_id = children.id;

UPDATE subjects SET user_id = year_groups.user_id
FROM year_groups WHERE subjects.year_group_id = year_groups.id;

UPDATE topics SET user_id = subjects.user_id
FROM subjects WHERE topics.subject_id = subjects.id;

UPDATE lessons SET user_id = topics.user_id
FROM topics WHERE lessons.topic_id = topics.id;

-- Step 3: Create triggers to auto-populate user_id on new inserts
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

-- Step 4: Update RLS policies to use simple user_id check
DROP POLICY IF EXISTS "Users can manage their own year groups" ON year_groups;
DROP POLICY IF EXISTS "Users can manage their own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can manage their own topics" ON topics;
DROP POLICY IF EXISTS "Users can manage their own lessons" ON lessons;

CREATE POLICY "Users can manage their own year groups" ON year_groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own topics" ON topics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lessons" ON lessons
  FOR ALL USING (auth.uid() = user_id);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_year_groups_user_id ON year_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);

-- Step 6: Make columns NOT NULL (only after all data is migrated)
-- Uncomment these only after verifying all rows have user_id:
-- ALTER TABLE year_groups ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE subjects ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE topics ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE lessons ALTER COLUMN user_id SET NOT NULL;
