# Changelog

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Bump version in package.json
-->

## 2026-02-08

### Added
- Enhanced YouTube playlist import functionality
- "Process YouTube" button to fetch playlist videos from URLs
- "Expand Playlists" button to convert playlist rows into individual lesson rows
- CORS proxy fallback support for playlist scraping
- Hardcoded playlist fallback for known playlists
- YouTube Data API v3 support (via VITE_YOUTUBE_API_KEY)
- Added types: ParsedRow, ExpandedLesson for playlist processing

### Changed
- CurriculumBuilder.tsx - Complete rewrite with paste/playlist modes
- utils/youtube.ts - Added scraping, API, and CORS proxy logic
- types.ts - Added ParsedRow and ExpandedLesson interfaces
- App.tsx - Updated handleBulkImport to use typed ParsedRow

### Fixed
- Fixed YouTube URL parsing with `&si=` parameter issue
- Fixed API key not being passed to YouTube functions
- Fixed Vite environment variable exposure (VITE_ prefix)
