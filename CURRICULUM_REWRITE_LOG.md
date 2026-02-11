# Curriculum Data Structure Rewrite Log

**Date:** February 2025 (Updated February 11, 2026)
**Purpose:** Restructure local storage and Supabase schema to support Topic-level nesting

---

## Previous Structure (Before Rewrite)

```
Child (Who)
  └── YearGroup (Year)
        └── Subject (Category: Topic) - Combined subject + topic in one field
              └── Lessons
```

## New Structure (After Rewrite)

```
Child (Who)
  └── YearGroup (Year)
        └── Subject (English, Maths, Science, etc.)
              └── Topic (Reading Comprehension, Algebra, etc.)
                    └── Lessons
                          └── Lesson Title, Lesson Focus, Notes, Video URL
```

---

## Issues Encountered & Fixed (2026-02-10)

### Issue 1: Upload Created Duplicate Kids
**Problem:** Upload button showed "3 children uploaded" when user had only 2.
**Root Cause:** `ensureUuid()` was generating new UUIDs for non-UUID IDs (`kid1`, `kid2`), causing upsert to create new records instead of updating existing.
**Fix:** Changed `ensureUuid()` to preserve original IDs for upsert matching.

### Issue 2: Children Used Non-UUID IDs
**Problem:** `Math.random().toString(36)` generated short IDs like `abc123xyz`, not valid UUIDs.
**Fix:** Changed `handleAddChildLocal` to use `crypto.randomUUID()`.

### Issue 3: Empty LocalStorage Loaded Test Data
**Problem:** "Clear Data" button wiped localStorage, but refresh reloaded `INITIAL_DATA` (3 test kids), causing duplicates.
**Fix:** Changed `getLocalData()` to return empty array instead of `INITIAL_DATA`.

### Issue 4: Duplicate Topic Cards
**Problem:** When importing rows with empty `topicName`, generated duplicate IDs.
**Fix:** Added fallback to "General" topic name and sanitized IDs with `replace(/-+/g, '-')`.

### Issue 5: Lesson Import Created Duplicates
**Problem:** Importing same spreadsheet twice added duplicate lessons.
**Fix:** Added deduplication check using video URL to skip existing lessons.

### Issue 6: Supabase Had Duplicate Rows
**Problem:** Multiple uploads with different ID generation created duplicate rows in Supabase.
**Fix:** Added cleanup buttons:
- 🧹 Clean DB - Removes duplicates from all tables
- 🔄 Deduplicate - Removes duplicate children
- 🎬 Dedupe Lessons - Removes duplicate lessons locally
- 💥 Nuke Supabase - Wipes all data

### Issue 7: getLocalData Returned Wrong Data Type
**Problem:** `fetchChildByEmail` returned single `ChildProfile` but was typed as `ChildProfile[]`.
**Fix:** Updated to return array and handle properly.

---

## Files Modified

### 1. `types.ts` - Core Type Definitions

**Changes:**
- Added new `Topic` interface with `id`, `name`, `lessons[]`, `timeSpentSeconds?`
- Updated `Subject` interface: now has `topics: Topic[]` instead of `lessons[]`
- Updated `YearGroup` → `Subject` → `Topic` → `Lesson` hierarchy
- Kept flat Db types for Supabase compatibility
- Updated ViewState to include `topicId` for LESSON_PLAYER

**Type Hierarchy:**
```typescript
ChildProfile {
  id, name, dob, avatar, themeColor
  └── yearGroups: YearGroup[]
}

YearGroup {
  id, name
  └── subjects: Subject[]
}

Subject {
  id, name, category, color
  └── topics: Topic[]
}

Topic {
  id, name
  └── lessons: Lesson[]
}

Lesson {
  id, title, durationMinutes, completed, videoUrl,
  outcomes[], lessonFocus?, lessonNotes?, deleted?,
  timeSpentSeconds?, videoPosition?
}

ViewState {
  // ...
  | { type: 'LESSON_PLAYER'; childId: string; subjectId: string; topicId: string; lessonId: string; origin: ViewOrigin }
}
```

---

### 2. `constants.ts` - Initial Data

**Changes:**
- Rewrote `INITIAL_DATA` to match new Topic structure
- Each Subject now has separate Topic objects

**Example:**
```typescript
{
  id: 'k1-y9-eng',
  name: 'English',           // Subject
  category: 'English',
  color: 'bg-amber-100',
  topics: [{
    id: 'k1-y9-eng-writing',
    name: 'Writing Narratives',  // Topic
    lessons: []
  }]
}
```

---

### 3. `components/CurriculumBuilder.tsx` - Import UI

**Changes:**
- Updated paste format to 8 columns
- Added Topic-level grouping in preview
- Added lesson deduplication by video URL

**Paste Format:**
```
Who | Year | Subject | Topic | Lesson Title | Lesson Focus | Notes | Video URL
```

**Column Mapping:**
```typescript
cols[0] = childName      // Who
cols[1] = yearGroup      // Year
cols[2] = subjectCategory // Subject (English, Maths)
cols[3] = subjectName     // Topic (Reading Comprehension)
cols[4] = lessonTitle     // Lesson Title
cols[5] = lessonFocus    // Aims/goals
cols[6] = lessonNotes    // Additional notes
cols[7] = videoUrl       // YouTube URL
```

**Preview Display:**
- Groups by Year → Subject → Topic
- Shows video count per topic
- Chevron expand/collapse for nested view

---

### 4. `App.tsx` - Main Application

**Key Changes:**

#### handleBulkImport (lines ~420-510)
- Rewrote to create hierarchy: Child → YearGroup → Subject → Topic → Lesson
- Finds or creates each level based on parsed rows
- Creates Topic before adding Lessons
- Skips lessons that already exist (by video URL)

```typescript
// Pseudocode
for each row:
  find/create child
  find/create yearGroup
  find/create subject (by name)
  find/create topic (by parsed subjectName)
  if lesson not exists (by videoUrl):
    add lesson to topic
```

#### handleCompleteLesson
- Updated to traverse: child → yearGroups → subjects → topics → lessons
- Signature changed: now includes `topicId` parameter

#### LessonPlayer Usage
- Updated to pass `topicId` prop
- Timer now tracks per topic, not per subject

#### Schedule Generator
- Updated to find and store topicId
- Works with any number of children (not hardcoded)

#### View Navigation
- LESSON_PLAYER now includes topicId
- Timeline onBlockClick passes topicId

#### Header Buttons Added
- 🗑️ Clear Data - Clears localStorage
- 🔄 Deduplicate - Removes duplicate children
- 💥 Nuke Supabase - Wipes Supabase
- 🧹 Clean DB - Cleans duplicate rows
- 🎬 Dedupe Lessons - Removes duplicate lessons

---

### 5. `lib/dataService.ts` - Data Layer

**Complete Rewrite**

**New Functions:**
- `saveYearGroup()` - Saves year group, then calls saveSubject for each
- `saveSubject()` - Saves subject, then calls saveTopic for each
- `saveTopic()` - Saves topic, then calls saveLesson for each
- `saveLesson()` - Saves individual lesson with new fields
- `migrateToTopicStructure()` - Converts old format to new Topic format
- `migrateChildToTopicStructure()` - Per-child migration

**fetchChildren()**
- Rewritten to fetch all levels: Children → YearGroups → Subjects → Topics → Lessons
- Builds in-memory maps for efficient lookup
- Returns complete hierarchy
- Added deduplication using Map

**uploadToSupabase()**
- Complete rewrite for Topic hierarchy
- Saves: Child → YearGroups → Subjects → Topics → Lessons
- Uses upsert for idempotent uploads

**loadFromSupabase()**
- Uses new fetchChildren() for full data retrieval

**getLocalData()**
- Returns empty array instead of INITIAL_DATA to prevent test data confusion
- Added debug logging

**saveLocalData()**
- Added debug logging

**ensureUuid()**
- Changed to preserve original IDs for upsert matching

---

### 6. `components/LessonPlayer.tsx`

**Changes:**
- Added `topicId` prop to track timer per topic
- Timer now uses `topicId` instead of `subject.id`

---

### 7. `components/Timeline.tsx`

**Changes:**
- Updated onBlockClick callback to pass `topicId`
- Added `topicId` to schedule block children data

---

### 8. `supabase_schema.sql` - Database Schema

**Added NEW table:**
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Lessons table changes:**
- `subject_id` → `topic_id` (foreign key to topics)

**Schema Hierarchy:**
```
children
  └── year_groups
        └── subjects
              └── topics
                    └── lessons
```

---

## Example Data Flow

### Paste Input:
```
Sophia	Year 5	English	Reading Comprehension	Video 1 - Inference Skills	inference skills	BBC videos	https://youtube.com/...
```

### Stored Structure:
```javascript
{
  name: "Sophia",
  yearGroups: [{
    name: "Year 5",
    subjects: [{
      name: "English",
      category: "English",
      color: "bg-amber-100",
      topics: [{
        name: "Reading Comprehension",
        lessons: [{
          title: "Video 1 - Inference Skills",
          lessonFocus: "inference skills",
          lessonNotes: "BBC videos",
          videoUrl: "https://youtube.com/...",
          videoPosition: 1,
          outcomes: ["inference skills"]
        }]
      }]
    }]
  }]
}
```

---

## Supabase Migration Required

**Before running app with new structure:**

1. Drop existing tables (or create new project):
```sql
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS year_groups;
DROP TABLE IF EXISTS children;
```

2. Run new schema:
```bash
# Copy contents of supabase_schema.sql to Supabase SQL Editor
```

**Or add Topic table to existing:**
```sql
CREATE TABLE topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lessons DROP COLUMN subject_id;
ALTER TABLE lessons ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE CASCADE;
```

---

## What's Still Needed

1. ✅ ViewState type - Added topicId to LESSON_PLAYER
2. ✅ LessonPlayer navigation - Now passes topicId
3. ✅ ScheduleBlock - Added topicId field
4. ✅ Timeline - Updated onBlockClick callback
5. ✅ handleDeleteTopicAtPath - Added at App level
6. ✅ Upload deduplication - Fixed ID preservation
7. ✅ Import deduplication - Skip existing lessons by video URL
8. ✅ Supabase cleanup - Added Clean DB button
9. ⏳ Progress Tracking - Stats already aggregate across topics
10. ⏳ Schedule Generator - Already updated for Topic-level scheduling

---

## Summary - What's Complete

✅ **Core Data Structure**
- Topic interface in types.ts
- Topic structure in constants.ts
- CurriculumBuilder with 8-column paste format
- dataService.ts with Topic hierarchy
- Supabase schema with topics table
- Migration function for old data

✅ **UI Components**
- SubjectDetail with expandable topic list
- Topics show lesson count and completion status
- Click to expand/collapse lessons
- Topic editing UI
- Topic deletion
- Add lesson button per topic
- Lesson editing
- Lesson deletion
- Timer uses topicId

✅ **Bug Fixes**
- Upload duplicate prevention (ID preservation)
- Child ID generation (crypto.randomUUID)
- LocalStorage fallback (empty array)
- Topic ID generation (sanitization)
- Lesson deduplication (video URL check)
- Supabase cleanup buttons
- Debug logging

✅ **Admin Tools**
- 🗑️ Clear Data - Clear localStorage
- 🔄 Deduplicate - Remove duplicate children
- 💥 Nuke Supabase - Wipe all Supabase data
- 🧹 Clean DB - Clean duplicate rows
- 🎬 Dedupe Lessons - Remove duplicate lessons

---

## Key Console Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables (.env)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_YOUTUBE_API_KEY=optional-youtube-key
```

---

## Testing Checklist

- [x] Import curriculum with new paste format
- [x] Verify Topic appears under Subject
- [x] Check lessons expand correctly
- [x] Verify Lesson Focus and Notes display in player
- [x] Test Upload to Supabase (no duplicates)
- [x] Test Load from Supabase
- [x] Verify timer tracks per topic
- [x] Check completion status persists
- [x] Test deduplication buttons
- [x] Test cleanup buttons

---

## Troubleshooting

### "No local data found. Add kids first via Manage Profiles"
1. Check browser console for `getLocalData:` logs
2. If `has data=false`, data was never saved
3. Add kids via Manage Profiles
4. Check `saveLocalData:` log shows correct count

### "Duplicate kids showing"
1. Click 🧹 Clean DB to remove duplicates
2. Or click 💥 Nuke Supabase and re-upload fresh

### "Upload says X children but I have Y"
1. ID mismatch between local and Supabase
2. Use 💥 Nuke Supabase to start fresh
3. Upload once after building curriculum

### "2x lessons showing"
1. Click 🎬 Dedupe Lessons to remove locally
2. Or 🧹 Clean DB to clean Supabase
