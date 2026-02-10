# Curriculum Data Structure Rewrite Log

**Date:** February 2025
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

## Files Modified

### 1. `types.ts` - Core Type Definitions

**Changes:**
- Added new `Topic` interface with `id`, `name`, `lessons[]`, `timeSpentSeconds?`
- Updated `Subject` interface: now has `topics: Topic[]` instead of `lessons[]`
- Updated `YearGroup` → `Subject` → `Topic` → `Lesson` hierarchy
- Kept flat Db types for Supabase compatibility

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
cols[5] = lessonFocus     // Aims/goals
cols[6] = lessonNotes     // Additional notes
cols[7] = videoUrl        // YouTube URL
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

```typescript
// Pseudocode
for each row:
  find/create child
  find/create yearGroup
  find/create subject (by name)
  find/create topic (by parsed subjectName)
  add lesson to topic
```

#### handleCompleteLesson
- Updated to traverse: child → yearGroups → subjects → topics → lessons
- Signature changed: now includes `topicId` parameter

#### LessonPlayer Usage
- Updated to pass `topicId` prop
- Timer now tracks per topic, not per subject

---

### 5. `lib/dataService.ts` - Data Layer

**Complete Rewrite**

**New Functions:**
- `saveYearGroup()` - Saves year group, then calls saveSubject for each
- `saveSubject()` - Saves subject, then calls saveTopic for each
- `saveTopic()` - Saves topic, then calls saveLesson for each
- `saveLesson()` - Saves individual lesson with new fields

**fetchChildren()**
- Rewritten to fetch all levels: Children → YearGroups → Subjects → Topics → Lessons
- Builds in-memory maps for efficient lookup
- Returns complete hierarchy

**uploadToSupabase()**
- Complete rewrite for Topic hierarchy
- Saves: Child → YearGroups → Subjects → Topics → Lessons

**loadFromSupabase()**
- Uses new fetchChildren() for full data retrieval

---

### 6. `components/LessonPlayer.tsx`

**Changes:**
- Added `topicId` prop to track timer per topic
- Timer now uses `topicId` instead of `subject.id`

---

### 7. `supabase_schema.sql` - Database Schema

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

1. **[IN PROGRESS] UI Updates** - SubjectDetail view needs to show Topics with expandable lessons
   - ✅ Added expandable topic list
   - ✅ Topics show lesson count and completion status
   - ✅ Click to expand/collapse lessons
   - ⏳ Play button to launch lesson
   - ⏳ Add lesson button per topic
   - ⏳ Delete topic button

2. **Topic Editing** - Add/delete topics from UI
3. **Lesson CRUD** - Add/edit/delete lessons within topics
4. **Progress Tracking** - Update stats to aggregate across topics
5. **Schedule Generator** - May need updates for Topic-level scheduling

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

- [ ] Import curriculum with new paste format
- [ ] Verify Topic appears under Subject
- [ ] Check lessons expand correctly
- [ ] Verify Lesson Focus and Notes display in player
- [ ] Test Upload to Supabase
- [ ] Test Load from Supabase
- [ ] Verify timer tracks per topic
- [ ] Check completion status persists
