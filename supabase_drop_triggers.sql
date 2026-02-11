-- Fix: Remove triggers and rely on application for user_id
-- This eliminates potential conflicts between triggers and app code

-- Drop all triggers
DROP TRIGGER IF EXISTS year_group_user_id_trigger ON year_groups;
DROP TRIGGER IF EXISTS subject_user_id_trigger ON subjects;
DROP TRIGGER IF EXISTS topic_user_id_trigger ON topics;
DROP TRIGGER IF EXISTS lesson_user_id_trigger ON lessons;

-- Drop trigger functions
DROP FUNCTION IF EXISTS set_year_group_user_id();
DROP FUNCTION IF EXISTS set_subject_user_id();
DROP FUNCTION IF EXISTS set_topic_user_id();
DROP FUNCTION IF EXISTS set_lesson_user_id();

-- RLS policies remain simple (auth.uid() = user_id)
-- App will now be responsible for passing user_id in all inserts
