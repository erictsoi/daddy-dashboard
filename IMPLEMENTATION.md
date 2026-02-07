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
