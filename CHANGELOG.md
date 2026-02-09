# Changelog

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Bump version in package.json
  -->

## 2026-02-09

### Added
- Netflix-style profile switcher dropdown on all dashboards (top-right position)
- Admin profile now appears in profile switcher with avatar, color, and name
- Manage Profiles page with inline editing for kids (expandable cards)
- Admin profile editing with avatar picker, color selection, and DOB
- Kids profile editing with avatar picker, color selection, and DOB
- Inline year group management for each kid profile
- Admin color theming that persists in localStorage
- Profile dropdown shows admin profile first, then kids profiles

### Changed
- Removed "Switch Profile" button that went to landing page (now in dropdown)
- Profile switcher positioned consistently on top-right across all views
- Manage Profiles consolidates all child management functionality
- Edit forms now expand inline below kid cards instead of separate section
- Cancel button on kid profiles properly closes the edit form
- Default kids profiles now have blank names (displayed as "Student")

### Removed
- "Manage Children" button from Daddy Dashboard header
- Standalone "Switch User" buttons (replaced with profile dropdown)
- Separate ChildManagement modal (functionality moved to Manage Profiles page)

## 2026-02-09

### Fixed
- YouTube playlist import not saving to Supabase - added deterministic ID generation for subjects and lessons
- Subjects now use stable IDs based on child-yearGroup-subjectName instead of Math.random()
- Lessons now use stable IDs based on subjectId-lessonTitle
- Added comprehensive debug logging to dataService.ts (saveYearGroup, saveSubject, saveLesson, saveFullCurriculum)

### Changed
- Removed default dummy YouTube video URL when no video provided (was `dQw4w9WgXcQ`, now empty string)
- Console logging added to handleBulkImport for import debugging

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
