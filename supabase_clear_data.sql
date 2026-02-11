-- Clear all data from Supabase (keeps schema, deletes rows)
-- Run in Supabase SQL Editor: https://supabase.com/project/YOUR_PROJECT/sql

-- Delete in order (respects foreign keys)
DELETE FROM lessons;
DELETE FROM topics;
DELETE FROM subjects;
DELETE FROM year_groups;
DELETE FROM children;

-- Verify
SELECT
  'children' as table_name,
  (SELECT COUNT(*) FROM children) as row_count
UNION ALL
SELECT 'year_groups', (SELECT COUNT(*) FROM year_groups)
UNION ALL
SELECT 'subjects', (SELECT COUNT(*) FROM subjects)
UNION ALL
SELECT 'topics', (SELECT COUNT(*) FROM topics)
UNION ALL
SELECT 'lessons', (SELECT COUNT(*) FROM lessons);

-- Result: All should show 0
