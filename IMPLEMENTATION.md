# Implementation

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Bump version in package.json
-->

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
