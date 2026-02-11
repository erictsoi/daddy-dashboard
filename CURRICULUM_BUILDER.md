# Curriculum Builder Documentation

## Overview

The Curriculum Builder is a powerful tool for bulk-importing curriculum data into the Daddy Dashboard. It supports two input methods: pasting spreadsheet data and importing YouTube playlists.

## Features

### 1. Paste Spreadsheet Mode

Import curriculum data by copying and pasting from Excel, Google Sheets, or any spreadsheet application.

**Column Format (8 columns):**

| Column | Field | Required | Description |
|--------|-------|----------|-------------|
| 1 | Child Name | Yes | Student name (e.g., "Sophia", "Adrian") |
| 2 | Year Group | Yes | Grade level (e.g., "Year 5", "Year 3") |
| 3 | Subject Category | Yes | Subject area (e.g., "English", "Maths", "Science") |
| 4 | Topic Name | Yes | Specific topic within subject (e.g., "Reading Comprehension") |
| 5 | Lesson Title | No | Title of the lesson (auto-generated from Topic if empty) |
| 6 | Lesson Focus | No | Learning outcomes or focus areas (comma-separated) |
| 7 | Notes | No | Additional notes for the lesson |
| 8 | Video URL | No | YouTube video or playlist URL |

**Example Input:**

```
Sophia	Year 5	English	Reading Comprehension	Video 1 - Inference Skills	inference skills	BBC curriculum videos	https://youtube.com/watch?v=abc123
Sophia	Year 5	Maths	Fractions	Video 1 - Introduction to Fractions	fractions, numeracy		Khan Academy	https://youtube.com/playlist?list=PLxyz
Adrian	Year 3	Science	Living Things	Video 1 - What is a Living Thing?	biology, classification		https://youtube.com/watch?v=xyz789
```

### 2. Paste Playlist URL Mode

Import entire YouTube playlists as lessons with default values applied to all videos.

**Steps:**
1. Paste a YouTube playlist URL
2. Set default values (Child Name, Year Group, Subject, Topic)
3. Click "Load Playlist"
4. Click "Import" to add all videos as lessons

**Note:** Requires YouTube API key for large playlists. Without API key, uses fallback scraping.

## Workflow

### Step 1: Paste Data

Copy data from your spreadsheet and paste into the text area. The preview updates automatically.

### Step 2: Parse URLs (Optional)

Click "Parse URLs" to process YouTube links. This:
- Validates YouTube URLs
- Fetches playlist metadata (requires API key)
- Prepares videos for expansion

### Step 3: Expand Playlists (Optional)

Click "Expand Playlists" to convert playlist entries into individual video lessons.

**Before Expansion:**
```
English > Reading Comprehension > Playlist (25 videos)
```

**After Expansion:**
```
English > Reading Comprehension > Video 1 - Title 1
English > Reading Comprehension > Video 2 - Title 2
...
English > Reading Comprehension > Video 25 - Title 25
```

### Step 4: Import

Click "Import X Lessons" to save all valid lessons to the curriculum.

**Validation Rules:**
- Must have Child Name, Year Group, Subject Category, and Topic Name
- Video URL is optional (creates "Self Study" lessons without videos)
- Duplicate lessons (same child + year + subject + topic + title) are skipped

## YouTube Integration

### API Key Setup

Set `VITE_YOUTUBE_API_KEY` in your `.env` file for full playlist support:

```bash
VITE_YOUTUBE_API_KEY=your_api_key_here
```

### Fallback Behavior

Without an API key:
- Single videos work normally
- Playlists use CORS proxies (limited to ~50 videos)
- Large playlists may be truncated

## Data Structure

### Imported Lesson Fields

```typescript
interface Lesson {
  id: string;                    // Generated ID
  title: string;                 // Lesson title
  durationMinutes: number;       // Default: 45
  completed: boolean;            // Default: false
  deleted: boolean;              // Default: false
  videoUrl: string;              // YouTube embed URL
  outcomes: string[];            // Learning outcomes from Lesson Focus
  lessonFocus: string;           // Original focus string
  lessonNotes: string;           // Original notes
  videoPosition: number;         // Position in playlist (1-indexed)
}
```

### Auto-Generated IDs

Lessons are assigned unique IDs based on:
- Topic ID
- Timestamp
- Random suffix

Example: `sophia-year5-english-reading-comprehension-topic-1739300000-abc123`

## Troubleshooting

### Invalid Rows

Rows appear as "invalid" if:
- Missing required fields (Child Name, Year Group, Subject, Topic)
- Malformed data format

### Import Failures

Common causes:
1. **Duplicate lessons**: Same child + year + subject + topic + title
2. **Supabase errors**: Check console for RLS policy errors
3. **Network issues**: Ensure Supabase connection is stable

### YouTube Errors

- **"Failed to load playlist"**: Check URL format, try API key
- **CORS errors**: Use VPN or add CORS proxy to yt-dlp server
- **Quota exceeded**: API quota limit reached, wait or use different key

## Best Practices

1. **Prepare data in spreadsheet**: Easier to edit and validate before import
2. **Use consistent naming**: Same child names, year groups, subjects
3. **Test with small batches**: Try 5-10 lessons first before full import
4. **Export before major imports**: Creates backup point
5. **Use Video Position**: Helps maintain lesson order in playlists

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl/Cmd + Enter | Import (when textarea focused) |
| Enter | Load playlist (in URL mode) |

## Export/Import Backup

Use the Export button in the Admin section to:
- Save curriculum as JSON file
- Create backup before bulk changes
- Transfer curriculum between accounts

## Related Files

- `components/CurriculumBuilder.tsx` - Main component
- `utils/youtube.ts` - YouTube API/scraping logic
- `types.ts` - TypeScript interfaces
- `App.tsx` - Handles bulk import and data persistence
