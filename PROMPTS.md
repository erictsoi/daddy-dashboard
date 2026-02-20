# Prompts

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Update CURRICULUM_REWRITE_LOG.md with curriculum changes
     5. Bump version in package.json
     -->

## 2026-02-21 - LessonView & KidDash Updates

**User Request:**
> lesson view to have a collapsable sidebar
> the sidebar doesnt go all the way to bottom of the screen
> the fractional numbers to be in a chip within each subject card
> subject icon within a rounded corner square
> in lessonview, this element is beneath the video element
> video to follow the proportions in the following
> to be left aligned
> text to be 10px
> push to github
> update logs

**Session Actions:**
- Added collapsible sidebar to LessonView with About, Learning Outcomes, Playlist
- Fixed sidebar to stretch full height (calc(100vh - 60px))
- Added progress chip (colored pill) to KidDash subject cards
- Added rounded square container with colored border around subject icons
- Added video player with dark theme, 16/9 aspect ratio, progress bar
- Added "Finish the video first" button below video (left aligned)
- Fixed Playlist label font size to 10px

---

## 2026-02-20 - V6 UI Views Migration

**User Request:**
> What did we do so far?
> continue if you have next steps, or stop and ask for clarification if you are unsure how to proceed
> C:\Users\user\Documents\daddy-dashboard\views\AdminDash.tsx this view to follow the look stated in C:\Users\user\Documents\daddy-dashboard\claude views\AdminDashboard.jsx
> http://localhost:3000/landingview to follow C:\Users\user\Documents\daddy-dashboard\claude views\LandingPage.jsx
> ok done
> ok admin dash flashes up for a second, then nothing
> push to git
> then cleanup the codebase
> the views within the views folder, are they inline code or does the code and styling in another place?
> update logs

**Session Actions:**
- Created v6 views matching designs in `claude views/` folder
- LandingView: carousel, animated hero, CTA button
- AdminDash: sidebar with kid links, schedule cards, progress bars
- KidDash: subjects grid linking to lessons
- LessonView: video player with lesson details
- Fixed routing issues causing admin dash to flash and redirect
- Simplified routes to use v6 views directly
- Deleted old Tailwind-based view files
- Committed changes to git

**Result:** All 5 core views implemented with inline styling (no Tailwind). Routes working correctly.

---

## 2026-02-19 - v6 Design System Phase 2 & 3

**User Request:**
> continue with C:\Users\user\Documents\daddy-dashboard\UI_IMPLEMENTATION_PLAN.md
> do phase 3
> update logs
> run dev

**Session Actions:**
- Completed Phase 2: Updated CurriculumBuilder and LessonPlayer headers with v6 design system
- Skipped Phase 3 card components due to complex nested JSX (risk of breaking)
- Timeline component already uses design system
- Ran dev server successfully on port 3000

**Result:** v6 design system applied to more components. Complex card areas in main views remain with Tailwind.

---

## 2026-02-18 - UI v6 Design System & View Cleanup

**User Request:**
> i want to use the current site and update the ui/ look with the code from C:\Users\user\Documents\daddy-dashboard\daddy_dashboard_v6_fixed.jsx
> yes continue
> update the logs, and create a ui implementation update plan
> run
> how many pages are there?
> [shows v6 has 5 pages]
> In the current app. [mapping old views to v6 naming]
> update the logs
> pls confirm that you have followed the ui outlined in daddy_dashboard_v6_fixed
> yes, also do run a dev
> do we need to seperate out th emain code block? is it still 1200+ lines long?
> yes
> a
> run
> update logs

**Session Completed:**
- Added tab shell navigation (like v6 reference)
- Added navigation comments to App.tsx
- Renamed views to match v6: HOME→ADMIN, CHILD_DASHBOARD→KIDSDASH, LESSON_PLAYER→LESSON
- Added RETURNING view
- Created design-system.tsx with all v6 components

**Views (7 total):**
| # | View | Description |
|---|------|-------------|
| 1 | LANDING | User selection |
| 2 | RETURNING | New - Returning user welcome |
| 3 | ADMIN | Daddy Dashboard |
| 4 | KIDSDASH | Kid's Dashboard |
| 5 | SUBJECT_DETAIL | Subject/Topic view |
| 6 | LESSON | Video player |
| 7 | CURRICULUM_BUILDER | Bulk import |

**App.tsx Structure:**
- Added navigation comments for each view section
- Tab shell at top for quick view switching
- ~3900 lines (kept inline due to state dependencies)

---

## 2026-02-14 - Child Sign-In & Profile Switching Session

**User Request:**
> i want to be able to signin with my kids account to view their profile
> check if this works
> its working now. but id like for the kids to easily switch profiles without having to sign in
> hide my dashboard (admin) when kid is logged in, but allow switching between kids
> the kids have admin hidden but need to switch between kids
> ... (multiple iterations to fix profile switching)

**Requirements:**
1. Kids sign in with their Google account
2. Parent email linked to child's profile for lookup
3. Kids can switch to sibling profiles without re-signing in
4. Admin dashboard hidden for kids
5. Dual schedule showing both kids on child's dashboard

**Session Completed:**
- Added googleEmail field to EditProfile component
- Added linkedAccounts lookup in Firebase
- Created parent email input on landing page
- Implemented allChildren state to store full curriculum
- Fixed profile switching to load sibling data
- Added Sign Out button to kid dropdown

---

## 2026-02-11 - Rework Session Complete

**User Request:**
> we just rewrote the data structure, we just finised putting the api keys into supabase
> i want to test the run dev to see if it works
> what is the best order to finish the rework?
> ok, once we have done each step, update the rework log
> update logs
> 1 (continue with rework)
> continue

**Requirements:**
1. Follow rework plan from IMPLEMENTATION_REWORK.md
2. Remove debug buttons
3. Remove localStorage persistence
4. Simplify AuthContext
5. Integrate Edge Function
6. Update logs after completion

**Rework Completed (All Steps):**
- ✅ Step 1: Removed debug buttons (Nuke, Deduplicate, Clean DB, Dedupe Lessons)
- ✅ Step 2: Removed localStorage data persistence (19 `saveLocalData()` calls replaced)
- ✅ Step 3: Simplified admin profile (removed DOB, hardcoded avatar/color)
- ✅ Step 4: Fixed TypeScript errors (5 argument order fixes, undefined functions)
- ✅ Step 5: Simplified AuthContext (removed unused UserRole type)
- ✅ Step 6: Integrated Edge Function (YouTube playlists now server-side)

**Files Modified:**
- `src/lib/supabase.ts`:
  - Added `saveFullCurriculum()`, `hardDeleteSubjectFromSupabase()`, `uploadToSupabase()`, `loadFromSupabase()`
- `src/lib/AuthContext.tsx`:
  - Removed `UserRole` type, `userRole` state
- `App.tsx`:
  - Removed 7 debug buttons
  - Replaced all `saveLocalData()` with `saveFullCurriculum(user.id, data)`
  - Simplified admin state (removed localStorage, DOB field)
- `components/CurriculumBuilder.tsx`:
  - Updated to use Edge Function `fetchPlaylistVideos()`
- `IMPLEMENTATION_REWORK.md`:
  - Documented all completed steps
- `CHANGELOG.md`:
  - Added v2.7.0 release notes

## 2026-02-11 - Export/Import UI & Documentation

**User Request:**
> update logs

**Requirements:**
1. Add Export/Import buttons to Admin section UI
2. Remove dangerous debug buttons
3. Create CURRICULUM_BUILDER.md documentation
4. Update all log files and bump version

**Output:**
- Added `exportDataToFile()` and `importDataFromFile()` functions to App.tsx
- Created hidden file input for JSON import
- Replaced "Admin Debug Tools" section with "Data Management" section
- Removed "Nuke All Data" and "Delete Duplicates" buttons
- Created `CURRICULUM_BUILDER.md` with complete usage guide

**Files Modified:**
- `App.tsx`:
  - Added `exportDataToFile()` - Downloads curriculum as JSON
  - Added `importDataFromFile()` - Parses JSON file
  - Added `importFileInputRef` - Hidden file input for import
  - Replaced debug buttons section with Export/Import buttons
- Created `CURRICULUM_BUILDER.md` - 200+ line documentation covering:
  - Two import modes (Paste Spreadsheet, Playlist URL)
  - Column format documentation
  - Workflow steps
  - YouTube integration details
  - Troubleshooting guide

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
