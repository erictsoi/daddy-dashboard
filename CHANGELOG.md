# Changelog

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Bump version in package.json
-->

## 2026-02-09

### Added
- Supabase authentication integration
- Google OAuth sign-in on Landing page
- AuthContext with useAuth() hook for managing user sessions
- Sign-out functionality

### Changed
- App.tsx wrapped with AuthProvider
- LandingView now shows user profile and sign-in/sign-out buttons

### Added
- Created src/lib/supabase.ts - Supabase browser client
- Created src/lib/AuthContext.tsx - Authentication context provider
- Created .env.example - Environment variables template

### Changed
- Data persistence now syncs with Supabase when authenticated
- Guest mode uses localStorage for data persistence
- All curriculum mutations save to localStorage (guest) or Supabase (auth)

### Added
- Created src/lib/dataService.ts - Data layer with dual persistence
- Created supabase_schema.sql - Database schema with RLS policies
- Types updated with DbChild, DbYearGroup, DbSubject, DbLesson interfaces

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
