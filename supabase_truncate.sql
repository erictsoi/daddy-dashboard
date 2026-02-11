-- COMPLETE WIPE - Delete all data permanently
-- Run this in Supabase SQL Editor

-- Disable triggers if any
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;

-- Delete all data (child tables first)
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE topics CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE year_groups CASCADE;
TRUNCATE TABLE children CASCADE;

-- Re-enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Verify all tables are empty
SELECT 'children' as table_name, COUNT(*) as row_count FROM children
UNION ALL
SELECT 'year_groups', COUNT(*) FROM year_groups
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'topics', COUNT(*) FROM topics
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons;
