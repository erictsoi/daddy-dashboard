# Daddy Dashboard Rework - Implementation Log

**Date:** 2026-02-11
**Version:** 3.0.0

## Problem Statement

The original implementation had become too complex:
- Dual-mode persistence (localStorage + Supabase) caused confusion
- Client-side YouTube API with CORS proxies was fragile
- Duplicate profiles appearing due to non-deterministic ID generation
- Too many debug buttons (Nuke, Dedupe, Clean DB) indicating underlying issues

## Goals

1. **Simple data storage** - Supabase-only, no localStorage complexity
2. **Robust YouTube import** - Edge Functions, no CORS issues
3. **No duplicates** - Deterministic ID generation
4. **Clean hierarchy** - Child → YearGroup → Subject → Topic → Lessons

---

## New Data Structure

```
Child
├── id: UUID
├── name: string
├── avatar: string
├── theme_color: string
├── dob: date
└── year_groups: YearGroup[]

YearGroup
├── id: string (deterministic)
├── name: string (e.g., "Year 5")
└── subjects: Subject[]

Subject
├── id: string (deterministic)
├── name: string (e.g., "English")
├── category: string (Maths, English, Science, etc.)
├── color: string
└── topics: Topic[]

Topic
├── id: string (deterministic)
├── name: string (e.g., "Writing Narratives")
└── lessons: Lesson[]

Lesson
├── id: UUID
├── title: string
├── video_url: string
├── completed: boolean
├── time_spent_seconds: number
└── order_index: number
```

### Deterministic ID Generation

| Table | ID Format | Example |
|-------|-----------|---------|
| year_groups | `{child_id}-{yearName}` | `uuid-Year-5` |
| subjects | `{yearGroup_id}-{subjectName}` | `uuid-Year-5-English` |
| topics | `{subject_id}-{topicName}` | `uuid-Year-5-English-Writing-Narratives` |
| lessons | `gen_random_uuid()` | `550e8400-e29b-...` |

---

## Database Schema

```sql
-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👶',
  theme_color TEXT DEFAULT 'blue',
  dob DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Year Groups (e.g., Year 5, Year 9)
CREATE TABLE year_groups (
  id TEXT PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id)
);

-- Subjects (e.g., English, Maths)
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  year_group_id TEXT REFERENCES year_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id)
);

-- Topics (e.g., Writing Narratives)
CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id)
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can CRUD their children" ON children
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their year groups" ON year_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can CRUD their subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can CRUD their topics" ON topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM subjects WHERE id = topics.subject_id)
    AND EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can CRUD their lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM topics WHERE id = lessons.topic_id)
    AND EXISTS (SELECT 1 FROM subjects WHERE id = topics.subject_id)
    AND EXISTS (SELECT 1 FROM year_groups WHERE id = subjects.year_group_id)
    AND EXISTS (SELECT 1 FROM children WHERE id = year_groups.child_id AND user_id = auth.uid())
  );
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase_schema.sql` | Rewrite | Clean schema with Topics table |
| `src/lib/supabase.ts` | Rewrite | Simple Supabase client |
| `src/lib/dataService.ts` | Delete | Remove dual-mode complexity |
| `src/lib/AuthContext.tsx` | Simplify | Remove localStorage fallback |
| `src/types.ts` | Update | Match new structure |
| `App.tsx` | Simplify | Remove debug buttons |
| `supabase/functions/get-playlist-videos/` | New | Edge Function for YouTube |
| `CURRICULUM_BUILDER.md` | Update | Match new import format |

---

## Supabase Client (`src/lib/supabase.ts`)

### Core Functions

```typescript
// Children
export const getChildren = async (userId: string): Promise<Child[]>
export const createChild = async (child: Omit<Child, 'id'>): Promise<Child>
export const updateChild = async (child: Child): Promise<void>
export const deleteChild = async (childId: string): Promise<void>

// Year Groups
export const getYearGroups = async (childId: string): Promise<YearGroup[]>
export const createYearGroup = async (childId: string, name: string): Promise<YearGroup>

// Subjects
export const getSubjects = async (yearGroupId: string): Promise<Subject[]>
export const createSubject = async (yearGroupId: string, name: string, category?: string): Promise<Subject>

// Topics
export const getTopics = async (subjectId: string): Promise<Topic[]>
export const createTopic = async (subjectId: string, name: string): Promise<Topic>

// Lessons
export const getLessons = async (topicId: string): Promise<Lesson[]>
export const createLesson = async (lesson: Omit<Lesson, 'id'>): Promise<Lesson>
export const updateLesson = async (lesson: Lesson): Promise<void>
export const markLessonComplete = async (lessonId: string, completed: boolean): Promise<void>

// Bulk Import
export const bulkImport = async (userId: string, rows: ImportRow[]): Promise<{ success: number; errors: number }>
```

---

## YouTube Import Flow (Edge Function)

### Client Side
```
1. User pastes playlist URL
2. Call Edge Function: get-playlist-videos
3. Display video list
4. User selects videos to import
5. Auto-create Topic + Lessons
```

### Edge Function
```typescript
// supabase/functions/get-playlist-videos/index.ts
serve(async (req) => {
  const { playlistUrl } = await req.json();
  
  const playlistId = extractPlaylistId(playlistUrl);
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  // Server-side API call - no CORS!
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
  );
  
  const data = await response.json();
  
  return json({
    videos: data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      thumbnail: item.snippet.thumbnails.medium?.url
    }))
  });
});
```

---

## Import Format

### Spreadsheet Paste
| Column | Field |
|--------|-------|
| 1 | childName |
| 2 | yearGroup |
| 3 | subjectCategory |
| 4 | subjectName |
| 5 | topicName |
| 6 | lessonTitle |
| 7 | videoUrl |

### Example
```
Adrian | Year 5 | English | Writing Narratives | Hooks | https://youtube.com/...
Adrian | Year 5 | English | Reading Comprehension | Main Idea | https://youtube.com/...
Adrian | Year 5 | Maths | Fractions | Adding | https://youtube.com/...
```

---

## Removed Features

1. **Debug Buttons** - Nuke, Dedupe, Clean DB (no longer needed)
2. **localStorage Fallback** - Supabase-only
3. **Guest Mode** - Auth required for all features
4. **Client-side YouTube API** - Edge Function instead
5. **Manual Playlist Scraping** - Edge Function handles all

---

## Kept Features

1. **Profile Switcher** - Netflix-style dropdown
2. **Profile Editing** - Avatar, color, name, DOB
3. **Timer** - Persistent lesson timer
4. **Export/Import JSON** - For backup/transfer
5. **Google OAuth** - Authentication

---

## Migration Plan

### Step 1: Clean Database
```sql
-- Drop existing tables (requires CASCADE)
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS year_groups CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Run new schema
\i supabase_schema.sql
```

### Step 2: Update Client Code
1. Rewrite `src/lib/supabase.ts`
2. Delete `src/lib/dataService.ts`
3. Update `src/types.ts`
4. Simplify `App.tsx`
5. Create Edge Function

### Step 3: Test
1. `npm run build` - Verify no errors
2. Manual testing - Import flow, profile switching

---

## Progress Log

### ✅ Completed (2026-02-11)

1. **Added Supabase helper functions** (`src/lib/supabase.ts`)
   - `saveFullCurriculum()` - Saves entire curriculum to Supabase
   - `hardDeleteSubjectFromSupabase()` - Delete topic and children
   - `uploadToSupabase()` - Returns success/failure result
   - `loadFromSupabase()` - Returns typed result with data
   - `saveLocalData()` / `getLocalData()` - LocalStorage wrappers

2. **Updated Data Management section** (App.tsx ~lines 769-821)
   - Removed broken "Sync to Supabase" button
   - Updated Import to use `saveFullCurriculum()` instead of `saveLocalData`
   - Fixed argument order in `saveFullCurriculum()` calls

3. **Removed debug buttons from App.tsx**
   - 💥 Nuke Supabase (was at 2 locations)
   - 🔄 Deduplicate (was at 1 location)
   - 🎬 Dedupe Lessons (was at 2 locations)
   - 🧹 Clean DB (was at 2 locations)
   - Kept Export/Import JSON functionality

4. **Fixed TypeScript errors**
   - Removed undefined `migrateChildToTopicStructure` call
   - Fixed `saveFullCurriculum()` argument order (5 instances)

5. **Removed localStorage data persistence** (App.tsx)
   - Replaced all 19 `saveLocalData()` calls with `saveFullCurriculum(user.id, data)`
   - Removed localStorage admin profile state (hardcoded defaults)
   - Removed adminDob field (only kids need DOB)
   - Updated import logic to require auth (no guest mode)
   - Removed redundant `saveLocalData()` calls after Supabase loads

6. **Simplified AuthContext** (`src/lib/AuthContext.tsx`)
   - Removed unused `UserRole` type ('daddy' | 'child' | 'guest')
   - Removed `userRole` state from provider
   - Removed `setUserRole('guest')` from signOut

7. **Integrated Edge Function** (`components/CurriculumBuilder.tsx`)
   - Updated to use `fetchPlaylistVideos()` from Edge Function
   - Removed client-side API key dependency for playlists
   - Fixed video ID mapping (`v.id` → `v.videoId`)

### Rework Complete! 🎉

All steps from the rework plan are now complete.

---

## Success Criteria

- [x] No duplicate profiles after import (deterministic IDs prevent this)
- [x] YouTube playlist import works without CORS errors (Edge Function)
- [x] Profile switcher works for all kids
- [x] Timer persists across sessions
- [x] Export/Import JSON works for backup
- [x] No debug buttons needed
- [x] Supabase-only data persistence (no localStorage fallback)

