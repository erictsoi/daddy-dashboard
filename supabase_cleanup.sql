-- COMPLETE CLEANUP - Run this to start fresh
-- This will delete ALL data but keep table structure

-- Step 1: Disable RLS temporarily to avoid permission issues during cleanup
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete all data (in correct order due to foreign keys)
DELETE FROM lessons;
DELETE FROM topics;
DELETE FROM subjects;
DELETE FROM year_groups;
DELETE FROM children;

-- Step 3: Re-enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify cleanup
SELECT 'children' as table_name, COUNT(*) as count FROM children
UNION ALL
SELECT 'year_groups', COUNT(*) FROM year_groups
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'topics', COUNT(*) FROM topics
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons;

-- Step 5: Show cleanup confirmation
SELECT 'Database cleaned successfully! All tables are now empty.' as status;
