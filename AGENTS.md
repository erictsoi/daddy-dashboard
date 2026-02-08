# Agent Conventions

## Update Logs Command

When user requests **"update logs"**, perform these 4 actions:

1. **CHANGELOG.md** - Document changes (added/changed/fixed)
2. **PROMPTS.md** - Record prompt context and requirements
3. **IMPLEMENTATION.md** - Update technical documentation
4. **package.json** - Bump version number (patch by default, minor for features, major for breaking changes)

## Version Bumping

| Change Type | Version Bump |
|-------------|--------------|
| Bug fixes | patch (2.1.0 → 2.1.1) |
| New features | minor (2.1.0 → 2.2.0) |
| Breaking changes | major (2.1.0 → 3.0.0) |

---

# Project: Daddy Dashboard

## Overview
HK Homeschool Dashboard for managing Adrian and Sophia's curriculum across multiple year groups.

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** lucide-react

## Data Structure
```
ChildProfile
├── name (Adrian / Sophia)
├── themeColor (indigo / rose)
├── yearGroups[]
    └── YearGroup
        └── subjects[]
            └── Subject
                └── lessons[]
                    └── Lesson
                        ├── title
                        ├── videoUrl (YouTube embed)
                        ├── completed
                        └── outcomes[]
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000+) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_YOUTUBE_API_KEY` | YouTube Data API v3 for playlist fetching |

---

# YouTube Playlist Import Pattern

## Data Flow
```
Paste/URL Input → Parse → Clean URL → Process (API/Scraper) → Expand → Import
```

## Types
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

## Fallback Chain (for playlist scraping)
1. YouTube Data API (with VITE_YOUTUBE_API_KEY)
2. KNOWN_PLAYLISTS cache (hardcoded)
3. CORS proxies (r.jina.ai, allorigins, corsproxy.io)

## Table Format (Paste Mode)
| Column | Field |
|--------|-------|
| 1 | childName |
| 2 | yearGroup |
| 3 | subjectCategory |
| 4 | subjectName |
| 5 | lessonTitle |
| 6 | notes |
| 7 | videoUrl |

---

# Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app, routing, handleBulkImport |
| `components/CurriculumBuilder.tsx` | Paste/playlist import UI |
| `utils/youtube.ts` | YouTube API/scraping logic |
| `types.ts` | TypeScript interfaces |
| `constants.ts` | INITIAL_DATA, SUGGESTED_TOPICS |
| `views/` | Page components |

---

# Views/Pages

| View | Purpose |
|------|---------|
| LANDING | User selection (Daddy / Adrian / Sophia) |
| HOME | Daddy Dashboard with schedule generator |
| CHILD_DASHBOARD | Kid's personal view |
| SUBJECT_DETAIL | Lesson list for a subject |
| LESSON_PLAYER | Video player with timer |
| CURRICULUM_BUILDER | Bulk import UI |

---

# Curriculum Builder Buttons

| Button | Purpose |
|--------|---------|
| Process YouTube | Fetch playlist videos from URL |
| Expand Playlists | Convert to individual lessons |
| Import X Lessons | Add to curriculum |

---

# Debugging Tips

- Check browser console for YouTube API key logs
- "API key: yes/no" shows if key is loaded
- "Loaded X videos" shows playlist fetch success
- Hardcoded KNOWN_PLAYLISTS used if API fails

---

# TODO: Authentication & Backend

## Goal
- Persist curriculum data across sessions
- Enable personalized YouTube recommendations for kids

## Tech Stack Addition
- **Supabase** - Backend (PostgreSQL + Auth)
- **Google OAuth** - Authentication

## Data Model (Supabase)

### Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auth.users) |
| email | text | Google account email |
| name | text | Display name |
| created_at | timestamptz | Creation time |

#### `children`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users.id |
| name | text | Child's name |
| avatar | text | Emoji avatar |
| theme_color | text | Tailwind color class |
| dob | date | Date of birth |
| google_email | text | Optional Google email for recommendations |
| order_index | int | Display order in admin |

#### `year_groups`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| child_id | uuid | Foreign key to children.id |
| name | text | e.g., "Year 5" |
| order_index | int | Display order |

#### `subjects`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| year_group_id | uuid | Foreign key to year_groups.id |
| name | text | e.g., "English: Writing Narratives" |
| category | text | Maths, English, Science, etc. |
| color | text | Tailwind color class |
| order_index | int | Display order |

#### `lessons`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| subject_id | uuid | Foreign key to subjects.id |
| title | text | Lesson title |
| video_url | text | YouTube embed URL |
| duration_minutes | int | Expected duration |
| outcomes | jsonb | Array of learning outcomes |
| completed | boolean | Completion status |
| time_spent_seconds | int | Actual time spent |
| deleted | boolean | Soft delete flag |
| order_index | int | Display order |

## Authentication Flow

```
Landing Page
└── "Sign in with Google"
    ├── Daddy (Admin)
    │   ├── Manage children (add/edit/delete)
    │   ├── Link child's Google email (optional)
    │   ├── Manage curriculum
    │   └── View schedule generator
    └── Kid (with Google account)
        └── Personal dashboard
            └── YouTube recommendations train on watch history

Landing Page (no sign-in)
└── Select Child (guest mode)
    └── Personal dashboard (no personalization)
```

## Implementation Order

1. **Setup Supabase**
   - Create project at supabase.com
   - Run SQL schema migrations
   - Get anon key and service role key

2. **Auth Integration**
   - Install @supabase/supabase-js and @supabase/ssr
   - Create Supabase client utilities
   - Implement Google OAuth flow

3. **Child Management**
   - Admin page to add/edit/delete children
   - Optional Google email field per child
   - Theme color and avatar selection

4. **Data Persistence**
   - Fetch curriculum from Supabase on load
   - Save changes (add/edit/delete lessons/subjects)
   - Handle offline-first with localStorage fallback

5. **YouTube Recommendations**
   - Kids sign in with Google in browser
   - Watch educational videos in dashboard
   - YouTube algorithm learns preferences naturally

## Environment Variables (Future)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side (CI/deploy only) |
