# Changelog

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Update CURRICULUM_REWRITE_LOG.md with curriculum changes
     5. Bump version in package.json
     -->

## 2026-02-11 - Version 2.7.0 (Rework Complete)

### Removed
- **Debug Buttons** - Nuke Supabase, Deduplicate, Clean DB, Dedupe Lessons
- **localStorage Data Persistence** - All saves now go to Supabase only
- **Guest Mode** - Authentication required for all features
- **Admin DOB Field** - Only children need DOB (for year calculation)
- **UserRole Type** - Simplified AuthContext

### Changed
- **Supabase-only Persistence** - Single source of truth, no localStorage fallback
- **Admin Profile** - Simplified to avatar + color only (defaults: 👨‍🏫, blue)
- **Import Flow** - Requires auth, saves directly to Supabase
- **Data Functions** - All `saveLocalData()` replaced with `saveFullCurriculum(user.id, data)`
- **YouTube Integration** - Uses Edge Function (no CORS issues)

### Fixed
- **TypeScript Errors** - Fixed 5 `saveFullCurriculum()` argument order issues
- **Broken Functions** - Removed undefined `migrateChildToTopicStructure()`
- **Sync Button** - Removed broken "Sync to Supabase" button

### Added
- **Supabase Helper Functions** - `saveFullCurriculum()`, `hardDeleteSubjectFromSupabase()`, etc.

## 2026-02-11 - Version 3.0.0 (MAJOR REWORK)

### Breaking Changes
- **Simplified Data Storage** - Removed dual-mode (localStorage + Supabase), now Supabase-only
- **New Data Structure** - Added Topics table between Subjects and Lessons
- **Deterministic IDs** - Year groups, subjects, and topics now use deterministic IDs to prevent duplicates
- **Removed localStorage fallback** - Auth required for all features

### Removed
- **Debug Buttons** - Nuke Supabase, Deduplicate, Clean DB (no longer needed)
- **Guest Mode** - Requires authentication
- **Client-side YouTube API** - Replaced with Edge Functions
- **dataService.ts** - Removed dual-mode complexity

### Added
- **Topics Table** - Child → YearGroup → Subject → Topic → Lessons hierarchy
- **Edge Function** - Server-side YouTube playlist fetching (no CORS)
- **Deterministic ID Generation** - `childId-yearName`, `yearGroupId-subjectName`, etc.

### Changed
- **Supabase-only persistence** - Single source of truth
- **Clean schema** - Proper RLS policies, unique constraints
- **Simplified data flow** - Load from Supabase, save to Supabase

### Import Format Update
| Column | Field |
|--------|-------|
| 1 | childName |
| 2 | yearGroup |
| 3 | subjectCategory |
| 4 | subjectName |
| 5 | topicName | (NEW)
| 6 | lessonTitle |
| 7 | videoUrl |

## 2026-02-11

### Added
- **Sync to Supabase button** - Manual sync button for sharing data with testers
- **Export Curriculum button** - Downloads current curriculum as JSON file with timestamp
- **Import Curriculum button** - Uploads JSON file and saves to localStorage

### Changed
- **LocalStorage-first storage** - All saves now go to localStorage only (reliable)
- **Removed auto-sync** - No more automatic Supabase syncing on every action
- **Simplified data loading** - Always loads from localStorage first, optional Supabase merge
- **Removed Check Subjects button** - Supabase diagnostic no longer needed

### Data Workflow
```
User works in app → data saves to localStorage (automatic)
User clicks Export → downloads JSON backup
User clicks Import → restores from JSON backup
User clicks Sync → uploads to Supabase (optional, for testers)
```

## 2026-02-11

### Added
- **Export Curriculum button** - Downloads current curriculum as JSON file with timestamp
- **Import Curriculum button** - Uploads JSON file and saves to Supabase/localStorage
- **CURRICULUM_BUILDER.md** - Complete documentation for bulk import tool

### Changed
- **Data Management section** - Replaced "Debug Tools" with clean "Data Management" section
- **Debug buttons removed** - Deleted "Nuke All Data" and "Delete Duplicates" buttons (dangerous operations)
- **Kept Check Subjects** - As read-only diagnostic tool

## 2026-02-10

### Fixed
- **Upload duplicate issue** - Changed `ensureUuid()` to preserve original IDs (`kid1`, `kid2`) instead of generating new UUIDs each upload. Prevents duplicates when uploading multiple times.
- **Child ID generation** - Changed from `Math.random()` to `crypto.randomUUID()` for valid UUIDs.
- **Topic ID generation** - Fixed duplicate IDs when `topicName` was empty by adding fallback to "General" and sanitizing IDs.
- **Lesson deduplication** - Import now skips lessons that already exist by video URL.
- **getLocalData fallback** - Changed from returning `INITIAL_DATA` (3 test kids) to returning empty array to prevent accidental test data uploads.

### Added
- **🔄 Deduplicate button** - Finds duplicate children by name in Supabase and removes extras.
- **💥 Nuke Supabase button** - Wipes all data from Supabase.
- **🗑️ Clear Data button** - Clears localStorage.
- **🧹 Clean DB button** - Removes duplicate rows from Supabase (lessons by videoUrl, topics/subjects/yearGroups by name).
- **🎬 Dedupe Lessons button** - Removes duplicate lessons locally by video URL.
- **Debug logging** - Added console.log to `getLocalData()`, `saveLocalData()`, and `uploadToSupabase()` for debugging.
- **Deduplication in fetchChildren** - Added deduplication when loading from Supabase using Map.

### Changed
- **Schedule generator** - Now works with any number of children (not hardcoded adrian/sophia).
- **Timeline onBlockClick** - Now passes `topicId` for proper lesson tracking.

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
