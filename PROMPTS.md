# Prompts

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Update CURRICULUM_REWRITE_LOG.md with curriculum changes
     5. Bump version in package.json
   -->

## 2026-02-10 - Supabase Deduplication & Data Cleanup

**User Request:**
> i need a nuke all data on local storage as well
> these buttons dont work
> i need a way to override the data in supabase, not just add to it. it keeps dulpicating my kids
> Got childrenData: 135 children. i only have 2 kids
> i need a delete duplicate button
> No local data found. Add kids first via Manage Profiles
> Year info is there, but the lessons, subject and topic cards are all gone

**Problems Identified:**
1. Upload created duplicate kids (showed "3 children" when user had 2)
2. Empty localStorage reloaded INITIAL_DATA (3 test kids) causing confusion
3. Child IDs used Math.random() instead of UUIDs
4. Topic IDs generated duplicates when topicName was empty
5. Lesson import added duplicates on re-import
6. Supabase had duplicate rows from multiple uploads with different ID generation
7. fetchChildByEmail returned wrong type (single object vs array)

**Requirements:**
1. Fix upload to preserve IDs and prevent duplicates
2. Add buttons to clear/clean/nuke data
3. Fix ID generation to use proper UUIDs
4. Add lesson deduplication by video URL
5. Add cleanup buttons for Supabase

**Output:**
- Fixed `ensureUuid()` to preserve original IDs for upsert
- Changed `handleAddChildLocal` to use `crypto.randomUUID()`
- Changed `getLocalData()` to return empty array instead of INITIAL_DATA
- Added lesson deduplication in `handleBulkImport` by video URL
- Fixed Topic ID generation with fallback to "General" and sanitization
- Added debug logging to `getLocalData()`, `saveLocalData()`, `uploadToSupabase()`

**Added Header Buttons:**
- 🗑️ Clear Data - Clears localStorage
- 🔄 Deduplicate - Removes duplicate children by name
- 💥 Nuke Supabase - Wipes all Supabase data
- 🧹 Clean DB - Removes duplicate rows from all tables
- 🎬 Dedupe Lessons - Removes duplicate lessons locally

**Fixed Files:**
- `lib/dataService.ts`:
  - `ensureUuid()` - Preserve IDs for upsert
  - `getLocalData()` - Return empty array
  - `saveLocalData()` - Added debug logging
  - `fetchChildren()` - Added deduplication with Map
- `App.tsx`:
  - `handleAddChildLocal` - Use crypto.randomUUID()
  - `handleBulkImport` - Skip existing lessons by video URL
  - Header buttons for data management

## 2026-02-09 - Supabase Authentication Integration

**User Request:**
> add auth integration

**Requirements:**
1. Install Supabase dependencies (@supabase/supabase-js, @supabase/ssr)
2. Create Supabase client utility
3. Implement Google OAuth authentication
4. Add sign-in button to Landing page
5. Manage session state with AuthContext

**Output:**
- Created `src/lib/supabase.ts` - Browser client for Supabase
- Created `src/lib/AuthContext.tsx` - React context with useAuth() hook
- Updated `App.tsx` with AuthProvider wrapper
- Updated `LandingView` with Google sign-in button
- Added `.env.example` template

## 2026-02-09 - Data Persistence Refactor

**User Request:**
> refactor (data persistence)

**Requirements:**
1. Move curriculum data from local state to Supabase tables
2. Support dual persistence (Supabase for auth, localStorage for guest)
3. Maintain existing functionality for both modes

**Output:**
- Created `src/lib/dataService.ts` with:
  - `fetchChildren()` - Load from Supabase
  - `saveLocalData()` / `getLocalData()` - LocalStorage fallback
  - CRUD operations for children, year_groups, subjects, lessons
- Updated `App.tsx`:
  - Load data on auth state change
  - Auto-save mutations to appropriate backend
- Created `supabase_schema.sql`:
  - Full database schema with tables and RLS policies
  - Seed function for sample data
- Updated `types.ts` with DB types (DbChild, DbYearGroup, etc.)

## 2026-02-09 - Profile Management System

**User Request:**
> Replace the switch profile with something like Netflix. Add edit profile page.

**Requirements:**
1. Create Netflix-style profile switcher dropdown on all dashboards
2. Move admin profile into the dropdown with avatar, color, name
3. Create Manage Profiles page with inline editing
4. Add avatar picker, color selection, and DOB for admin and kids
5. Position profile dropdown consistently on top-right
6. Consolidate child management into Manage Profiles page
7. Make edit forms expand inline below kid cards
8. Allow switching back to admin from any kid dashboard

**Output:**
- Updated `ProfileSwitcher` component with:
  - Admin profile section in dropdown
  - Kids profiles list
  - Manage Profiles and Sign Out actions
  - Positioned consistently top-right
- Created `ManageProfilesView` in App.tsx with:
  - Admin profile editing (avatar, color, DOB)
  - Kids list with expandable edit forms
  - Inline year group management
  - Add/Delete student functionality
- Updated all views (Landing, DaddyDashboard, ChildDashboard) with ProfileSwitcher
- Removed standalone "Manage Children" button and "Switch User" buttons
- Added 78 emoji avatars with pagination
- Added 15 theme colors for profile customization

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
