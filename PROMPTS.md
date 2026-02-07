# Prompts

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Bump version in package.json
-->

## 2026-02-08 - YouTube Playlist Import Enhancement

**User Request:**
> i need you to implement something similar in this project, enhance the scraping/ api logic, and add playlist expansion to create seperate lessons for each video

**Reference Document:**
- `YOUTUBE_PLAYLIST_IMPORT_LOGIC.md` from another fork

**Requirements:**
1. Enhance scraping/CORS proxy logic for YouTube playlists
2. Add YouTube Data API support
3. Add playlist expansion to create individual lessons per video
4. Handle CORS blocking from YouTube

**Output:**
- Enhanced `utils/youtube.ts` with:
  - `parseYouTubeUrl()` - Detect video vs playlist URLs
  - `fetchPlaylistVideosFromApi()` - YouTube Data API integration
  - `scrapePlaylistFromBrowser()` - CORS proxy fallback
  - `processYouTubeUrl()` - Unified function with smart fallback
  - `KNOWN_PLAYLISTS` cache for common playlists
- Updated `types.ts` with `ParsedRow` and `ExpandedLesson`
- Updated `CurriculumBuilder.tsx` with Process/Expand buttons
- Updated `App.tsx` handleBulkImport for typed rows
