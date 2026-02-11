# Implementation

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Bump version in package.json
     -->

## 2026-02-11 Rework Status

### Completed
- ✅ Removed debug buttons (Nuke, Deduplicate, Clean DB, Dedupe Lessons)
- ✅ Removed localStorage data persistence (Supabase-only)
- ✅ Simplified admin profile (hardcoded avatar/color, removed DOB)
- ✅ Fixed TypeScript errors

### In Progress
- Simplify AuthContext (remove localStorage fallback)

### Pending
- Create Edge Function for YouTube playlist fetching

---

## Profile Management System

### Architecture

```
App.tsx
├── ProfileSwitcher (top-right on all views)
│   ├── Admin profile (with avatar, color, name)
│   ├── Kids profiles list
│   ├── Manage Profiles action
│   └── Sign Out action
├── ManageProfilesView
│   ├── Admin section (expandable edit form)
│   │   ├── Avatar picker (78 options, paginated)
│   │   ├── Color picker (15 theme colors)
│   │   └── DOB field
│   └── Kids list (inline expandable edit)
│       ├── Name field
│       ├── Avatar picker
│       ├── Color picker
│       ├── DOB field
│       └── Year groups management
```

### Profile Switcher Component

**Location:** Inline in App.tsx (reusable component)

**Props:**
```typescript
{
  user: any;
  data: ChildProfile[];
  adminAvatar: string;
  adminColor?: string;
  adminName?: string;
  onSignOut: () => void;
  onManageProfiles: () => void;
  onSwitchProfile: (childId: string) => void;
  onGoToLanding: () => void;
  onGoToAdmin?: () => void;
}
```

**Features:**
- Dropdown positioned absolute, right-aligned
- Dark theme (bg-gray-900) for Netflix-style look
- Admin profile shown first with "Admin" subtitle
- Kids profiles shown with colored avatars
- Menu actions: Manage Profiles, Sign Out

### Admin Profile State

**Persistence:** localStorage
```typescript
const [adminAvatar, setAdminAvatar] = useState(() => 
  localStorage.getItem('admin_avatar') || '👨‍🏫'
);
const [adminColor, setAdminColor] = useState(() => 
  localStorage.getItem('admin_color') || 'blue'
);
```

**Theme Colors (15 options):**
- Blue, Indigo, Purple, Pink, Rose
- Red, Orange, Amber, Yellow
- Green, Emerald, Teal, Cyan, Sky, Slate

### Kids Profile Editing

**Inline Edit Form:**
- Expands below kid card when `editingChildId === child.id`
- Contains: name input, avatar picker (paginated), color picker, DOB
- Cancel button closes form
- Save updates data state and persists to Supabase/localStorage

**Year Groups Management:**
- Separate expandable section per kid
- List existing year groups with delete button
- Input field to add new year groups

### Default Profiles

**INITIAL_DATA now includes 3 generic kids:**
- kid1 (🧑‍🚀, indigo theme) - Years 9-10
- kid2 (👩‍🎨, rose theme) - Years 5-6  
- kid3 (🎓, emerald theme) - Year 1

All with blank names (displayed as "Student" in UI)

### Navigation Updates

**Views with ProfileSwitcher:**
1. LandingView - top-right in header
2. DaddyDashboardView - top-right in header
3. ChildDashboardView - top-right, justify-end
4. ManageProfilesView - no switcher (this IS the profile page)

**Removed:**
- "Manage Children" button from DaddyDashboard
- "Switch User" buttons
- ChildManagement modal (consolidated into ManageProfilesView)

## YouTube Playlist Import Logic

### Architecture

```
CurriculumBuilder.tsx
├── paste mode: Parse tab-separated data
├── playlist mode: Direct URL input
├── loadPlaylist(): Fetch videos via API/scraper
├── processYouTube(): Expand YouTube URLs
└── expandPlaylists(): Convert to individual lessons
```

### YouTube URL Processing Flow

1. **Parse Input** - Extract URL from column 7 (Video Link)
2. **Clean URL** - Remove `&si=` parameter, extract playlist ID
3. **Process URL** - `processYouTubeUrl()`:
   - Check KNOWN_PLAYLISTS cache first
   - Try YouTube Data API (if key available)
   - Fall back to CORS proxy scraping
4. **Expand** - Create one ParsedRow per video

### CORS Proxies (Fallback Order)

1. YouTube Data API (requires VITE_YOUTUBE_API_KEY)
2. r.jina.ai (text extraction)
3. api.allorigins.win
4. corsproxy.io
5. Hardcoded KNOWN_PLAYLISTS fallback

### Table Format Support

| Column | Field |
|--------|-------|
| 1 | childName |
| 2 | yearGroup |
| 3 | subjectCategory |
| 4 | subjectName |
| 5 | lessonTitle (or "YouTube Playlist") |
| 6 | notes |
| 7 | videoUrl |

### Environment Variables

```env
VITE_YOUTUBE_API_KEY=  # YouTube Data API v3 key (optional)
```

### Key Files

| File | Purpose |
|------|---------|
| `utils/youtube.ts` | YouTube URL parsing, API calls, scraping |
| `types.ts` | ParsedRow, ExpandedLesson interfaces |
| `components/CurriculumBuilder.tsx` | UI for paste/playlist modes |
| `App.tsx:280-311` | handleBulkImport for importing lessons |

### Types

```typescript
interface ParsedRow {
  childName: string;
  yearGroup: string;
  subjectCategory: string;
  subjectName: string;
  lessonTitle: string;
  notes: string;
  videoUrl: string;
  isValid: boolean;
  isYouTubeUrl: boolean;
  youTubeType?: 'video' | 'playlist';
  expandedLessons?: ExpandedLesson[];
}

interface ExpandedLesson {
  title: string;
  videoUrl: string;
  videoId: string;
  position: number;
}
```

## Authentication (Supabase)

### Setup

1. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Environment variables** (`.env`)
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Supabase Dashboard**
   - Enable Google OAuth provider in Authentication → Providers
   - Add your domain to authorized redirect URLs

### Architecture

```
App.tsx
└── AuthProvider
    └── useAuth() hook
        ├── user: User | null
        ├── session: Session | null
        ├── signInWithGoogle()
        └── signOut()
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase browser client |
| `src/lib/AuthContext.tsx` | Auth context provider |
| `App.tsx` | Wrapped with AuthProvider, sign-in on Landing |

### Usage

```typescript
import { useAuth } from './src/lib/AuthContext'

const MyComponent = () => {
  const { user, signInWithGoogle, signOut } = useAuth()
  
  if (!user) {
    return <button onClick={signInWithGoogle}>Sign in</button>
  }
  
  return <button onClick={signOut}>Sign out</button>
}
```

## Data Persistence

### Architecture

```
App.tsx
└── useAuth()
    └── user: User | null
        └── fetchChildren(user.id) → ChildProfile[]
            └── Supabase tables: children → year_groups → subjects → lessons

Guest Mode
└── localStorage('daddy_dashboard_data')
    └── ChildProfile[] (INITIAL_DATA fallback)
```

### Data Flow

1. **Authenticated User**
   - On load: `fetchChildren(user.id)` → Supabase
   - On change: Update Supabase tables
   - Falls back to localStorage if Supabase empty

2. **Guest Mode**
   - On load: `getLocalData()` → localStorage or INITIAL_DATA
   - On change: `saveLocalData()` → localStorage

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/dataService.ts` | CRUD operations for Supabase + localStorage |
| `src/lib/supabase.ts` | Supabase client |
| `App.tsx` | Loads data based on auth state |

### Functions

```typescript
// Supabase (authenticated)
fetchChildren(userId: string): Promise<ChildProfile[]>
saveChild(child: ChildProfile, userId: string): Promise<string>
deleteLesson(lessonId: string): Promise<void>
markLessonComplete(lessonId: string, completed: boolean, timeSpentSeconds?: number): Promise<void>

// Local (guest mode)
getLocalData(): ChildProfile[]
saveLocalData(data: ChildProfile[]): void
```

### Database Schema

See `supabase_schema.sql` for full schema with RLS policies.

### Environment Variables

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Profile Management

### User Profile Edit (Netflix-style)

Kids can edit their own profiles from the landing page or child dashboard.

**Features:**
- Avatar selection with pagination (40+ emojis)
- Theme color selection (14 colors)
- Name customization
- DOB NOT included (managed by Daddy in admin)

**Key Files:**
| File | Purpose |
|------|---------|
| `components/EditProfile.tsx` | Profile editor modal |
| `components/ChildManagement.tsx` | Daddy admin for managing children |

### Child Management (Daddy Dashboard)

Daddy manages children's core settings:

**Features:**
- Add/remove children
- DOB entry (auto-suggests school year)
- Add/remove year groups per child
- Link Google email for personalized recommendations
- Delete children and all their data

**Automatic Year Calculation (HK System):**
```typescript
// Year 1 starts at age 5, school year starts September
const calculateSchoolYear = (dob: string) => {
  const birthMonth = new Date(dob).getMonth();
  const age = currentMonth >= 8 
    ? currentYear - birthYear 
    : currentYear - birthYear - 1;
  const schoolYear = age - 4; // Year 1 = age 5
  return `Year ${schoolYear}`;
}
```

## Persistent Timer

### Architecture

Tracks total time spent on each subject, persisting across sessions.

```
Subject View / Lesson Player
└── usePersistentTimer(subjectId)
    ├── localStorage key: `timer_{subjectId}`
    ├── Auto-saves every 30 seconds
    └── Survives page refresh & browser close
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/useTimer.ts` | Timer hook with persistence |
| `SubjectDetail.tsx` | Shows timer in header + stats |
| `LessonPlayer.tsx` | Shows timer during lessons |

### Usage

```typescript
const { isRunning, elapsed, start, stop } = usePersistentTimer({
  subjectId: 'math-1',
  onTick: (seconds) => {},  // Optional callback
  onSave: (seconds) => {},   // Optional save callback
  autoSaveInterval: 30,      // Save every 30s
});
```

### Timer Display

- **HH:MM:SS format** during sessions
- **Green dot indicator** when running
- **Pause/Resume** button
- **Persistent across** subject → lesson → exit → return

## Stretch Goals

### Term/Year Rewards System

**Features:**
- Daddy defines rewards per term (e.g., "Family trip to Disney", "New bike")
- Reminders shown at:
  - End of each term
  - End of exam periods
  - Beginning of new term

**Database Schema Extension:**

```sql
-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- e.g., "Disney Trip"
  description TEXT,              -- Details about reward
  type TEXT NOT NULL,            -- 'trip', 'gift', 'experience'
  target_term TEXT,              -- e.g., "Term 1", "Summer"
  target_year INT,               -- e.g., 2026
  is_claimed BOOLEAN DEFAULT FALSE,
  child_id UUID REFERENCES children(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Term dates for reminders
CREATE TABLE terms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,            -- "Term 1", "Term 2", etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  academic_year INT NOT NULL,   -- 2025-2026
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Family Trip Suggestions

At end of academic year, Daddy Dashboard shows:

```
📍 End of Year Trip Suggestions

Based on children's interests and school performance:
• 🎢 Theme Park Day (all subjects ≥ 80%)
• 🏖️ Beach Trip (math average ≥ 75%)
• 🎨 Museum Visit (humanities ≥ 70%)
• 🏔️ Hiking Adventure (all ≥ 60%)

Add custom trip suggestion...
```

### Term End Reminders

```
🎉 Term 1 Complete!

Rewards available:
✅ Adrian - Family movie night (all subjects completed!)
⏳ Sophia - 2/3 subjects completed

Upcoming: Term 2 starts on April 15, 2026
```

### Implementation Roadmap

1. **Phase 1: Rewards System**
   - Add rewards table and CRUD
   - Simple "Claim Reward" button
   - Display available rewards on child dashboard

2. **Phase 2: Term Management**
   - Define term dates
   - Auto-detect current term
   - Show term progress

3. **Phase 3: Intelligent Suggestions**
   - Analyze subject performance
   - Suggest family activities
   - Link rewards to achievements

4. **Phase 4: Exam Period Tracking**
   - Track exam dates
   - Show countdowns
   - Reward after exam completion

---

## Data Cleanup & Deduplication Tools

### Overview

Added admin tools to manage data integrity issues that arise from:
- Multiple uploads with different ID generation
- Importing curriculum multiple times
- Test data confusion

### Header Buttons

Located in Daddy Dashboard header (right side):

| Button | Icon | Purpose |
|--------|------|---------|
| 🗑️ Clear Data | Trash | Clears localStorage, refreshes page |
| 🔄 Deduplicate | Recycle | Removes duplicate children by name |
| 💥 Nuke Supabase | Explosion | Deletes ALL data from Supabase |
| 🧹 Clean DB | Broom | Removes duplicate rows from all tables |
| 🎬 Dedupe Lessons | Film | Removes duplicate lessons locally |

### Usage Scenarios

#### Scenario 1: "Upload says 3 kids but I have 2"
1. Click 🔄 Deduplicate → Confirm
2. Waits for reload
3. Done - duplicates removed

#### Scenario 2: "Everything is duplicated"
1. Click 🧹 Clean DB → Confirm twice
2. Waits for reload
3. All duplicate rows removed

#### Scenario 3: "Start completely fresh"
1. Click 💥 Nuke Supabase → Confirm twice
2. Waits for reload
3. Add kids via Manage Profiles
4. Build curriculum
5. Upload once

#### Scenario 4: "LocalStorage has wrong data"
1. Click 🗑️ Clear Data → Confirm
2. Page reloads with empty state
3. Load from Supabase or rebuild

### Deduplication Logic

#### Children Deduplication
```typescript
// Find duplicates by name
const nameCount: Record<string, string[]> = {};
children.forEach(c => {
  if (!nameCount[c.name]) nameCount[c.name] = [];
  nameCount[c.name].push(c.id);
});

// Keep first, delete rest
const duplicates = Object.values(nameCount).flatMap(ids => ids.slice(1));
await supabase.from('children').delete().in('id', duplicates);
```

#### Lesson Deduplication
```typescript
// Find duplicates by videoUrl
const urlCount: Record<string, string[]> = {};
lessons.forEach(l => {
  if (l.video_url) {
    if (!urlCount[l.video_url]) urlCount[l.video_url] = [];
    urlCount[l.video_url].push(l.id);
  }
});

// Keep first, delete rest
const duplicates = Object.values(urlCount).flatMap(ids => ids.slice(1));
await supabase.from('lessons').delete().in('id', duplicates);
```

#### Topic Deduplication
```typescript
// Find duplicates by subject_id + name
const nameCount: Record<string, string[]> = {};
topics.forEach(t => {
  const key = `${t.subject_id}::${t.name}`;
  if (!nameCount[key]) nameCount[key] = [];
  nameCount[key].push(t.id);
});

// Keep first, delete rest
```

### Debug Logging

Added console logging to help diagnose issues:

```typescript
// getLocalData()
console.log('getLocalData: key=', STORAGE_KEY, 'has data=', !!stored);
console.log('getLocalData: parsed type=', typeof parsed, 'length=', parsed?.length);

// saveLocalData()
console.log('saveLocalData: saving', data.length, 'children:', data.map(c => c.name));

// uploadToSupabase()
console.log('uploadToSupabase: localData:', localData.length, 'children');
console.log('Uploaded children IDs:', localData.map(c => c.id));
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Upload says X kids, have Y | ID mismatch between uploads | Use 💥 Nuke Supabase, upload fresh |
| 2x lessons showing | Import ran twice | Use 🧹 Clean DB or 🎬 Dedupe Lessons |
| Test data keeps appearing | getLocalData fallback | Use 🗑️ Clear Data |
| 135 kids loaded | Test data in Supabase | Use 💥 Nuke Supabase |
| Can't upload | localStorage empty | Add kids via Manage Profiles first |

### ID Generation Fixes

#### Before (caused duplicates)
```typescript
id: Math.random().toString(36).substr(2, 9)  // "abc123xyz"
id: generateUuid()  // New UUID every time
```

#### After (preserves IDs)
```typescript
// ensureUuid() - preserves existing UUIDs
if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
  return id  // Keep existing UUID
}
return generateUuid()  // Only generate for new records
```

#### Child ID Fix
```typescript
// handleAddChildLocal - use proper UUID
id: crypto.randomUUID()
```

#### Topic ID Fix
```typescript
// handleBulkImport - sanitize empty names
const topicName = row.subjectName || 'General';
id: `${subject.id}-${topicName.replace(/[^a-z0-9]/gi, '-')}`.toLowerCase().replace(/-+/g, '-').slice(0, 50)
```

### Lesson Import Deduplication

Prevents importing same lesson twice:

```typescript
// Check if lesson exists by video URL
const videoId = row.videoUrl?.includes('youtu') ?
  row.videoUrl.split('/').pop()?.split('?')[0] : null;

const lessonExists = topic.lessons.some(l => {
  if (videoId && l.videoUrl?.includes(videoId)) return true;
  return false;
});

if (lessonExists) {
  console.log('Lesson already exists, skipping:', row.videoUrl);
  return;  // Skip this lesson
}
```

## JSON Export/Import System

### Overview

Added JSON file export/import for curriculum backup and transfer.

### Features

- **Export Curriculum** - Downloads all children, year groups, subjects, topics, and lessons as JSON
- **Import Curriculum** - Uploads JSON file and syncs to Supabase/localStorage
- **Version metadata** - Export includes version number and timestamp
- **Auto-save on import** - Import automatically persists to Supabase for authenticated users

### Architecture

```
App.tsx
├── exportDataToFile(data, filename)
│   ├── Creates Blob with versioned JSON
│   ├── Triggers browser download
│   └── Default: daddy-dashboard-export-[date].json
│
├── importDataFromFile(file)
│   ├── FileReader to parse JSON
│   ├── Validates children array
│   └── Returns Promise<ChildProfile[]>
│
└── Data Management Section (Admin UI)
    ├── [Export Curriculum] → exportDataToFile(data)
    ├── [Import Curriculum] → hidden file input
    └── [Check Subjects] → Read-only diagnostic
```

### Export Format

```json
{
  "version": 1,
  "exportedAt": "2026-02-11T10:30:00.000Z",
  "children": [
    {
      "id": "uuid",
      "name": "Sophia",
      "avatar": "👧",
      "themeColor": "rose",
      "dob": "2015-03-15",
      "yearGroups": [...]
    }
  ]
}
```

### Import Flow

1. User clicks "Import Curriculum"
2. Hidden file input opens file picker
3. User selects JSON file
4. `importDataFromFile()` parses and validates
5. If logged in: `saveFullCurriculum()` → Supabase
6. If guest: `saveLocalData()` → localStorage
7. Page reloads to reflect imported data

### File Location

| File | Purpose |
|------|---------|
| `App.tsx:13-49` | exportDataToFile, importDataFromFile functions |
| `App.tsx:1198-1260` | Data Management UI section |
| `CURRICULUM_BUILDER.md` | User documentation |

### Usage Scenarios

#### Backup Before Major Changes
1. Click [Export Curriculum]
2. Save JSON file to computer
3. Make changes
4. If issues: Import from backup

#### Transfer Between Accounts
1. Export from Account A
2. Sign out, sign in to Account B
3. Import JSON
4. Data transferred

#### Cross-Device Sync
1. Export on laptop
2. Import on desktop
3. Both have same curriculum

### Error Handling

| Error | Handling |
|-------|----------|
| Invalid JSON | Reject with "Invalid file format" |
| Missing children array | Reject with error |
| Supabase error | Show toast notification |
| Network timeout | Fallback to localStorage for guest |
