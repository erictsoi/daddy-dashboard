# Changelog

<!-- CONVENTION: When "update logs" is requested:
     1. Update CHANGELOG.md with changes
     2. Update PROMPTS.md with context
     3. Update IMPLEMENTATION.md with technical details
     4. Update CURRICULUM_REWRITE_LOG.md with curriculum changes
     5. Bump version in package.json
     -->

## 2026-02-21 - Version 3.7.1 (Benday Shadow Fixes)

### Changed
- **ReturningView** - Added custom Shadow component with Benday dot effect
- **Hover animations** - Shadow now moves in tandem with card during hover

## 2026-02-21 - Version 3.7.0 (UI Styling Updates)

### Changed
- **KidDash** - Full refactor to match KidsDashboard.jsx design spec
  - Added Texture, Blobs, Deco background components
  - Added Chip and SectionHead components
  - Schedule cards with Shadow wrapper, colored backgrounds by status
  - Subject cards in 4-column grid with fadeUp animations
  - Direct navigation to lesson view on card click (removed GO! button)
  - Float animation on active schedule card (Science)
  - Fixed LUNCH card to match other card proportions (148x148)
  - Added paddingTop to schedule container to prevent hover clipping
- **AdminDash** - Updated kid cards to 180x220 with theme colors
- **ReturningView** - Updated profile cards to 180x220

## 2026-02-21 - Version 3.6.0 (LessonView & KidDash Updates)

### Added
- **LessonView collapsible sidebar** - Stretches full height, contains About, Learning Outcomes, Playlist
- **Video player** - Dark theme with 16/9 aspect ratio, progress bar, simulate video end button
- **Complete button** - Below video, unlocks when video ends
- **KidDash header** - Cream/glassmorphism header with logo, streak badge, profile avatar

### Changed
- **KidDash subject cards** - Progress chip with colored background, icon in colored rounded square

## 2026-02-20 - Version 3.5.0 (V6 UI Views)

### Added
- **New v6 UI views** - Created standalone views matching designs in `claude views/` folder:
  - `views/LandingView.tsx` - Landing page with carousel, animated hero, CTA
  - `views/AdminDash.tsx` - Admin dashboard with sidebar, kid cards, schedule
  - `views/KidDash.tsx` - Kid dashboard with subjects linking to lessons
  - `views/LessonView.tsx` - Lesson player page
  - `views/ReturningView.tsx` - Profile picker with direct navigation
- **Dummy data** - Created `src/data/dummyData.ts` with 6 kids (Amara, Marcus, Sophia, Kai, Adrian, Rohan)

### Changed
- **Routes** - Simplified to use v6 views directly:
  - `/`, `/landingview` → LandingView
  - `/returningview` → ReturningView (profile picker)
  - `/kiddash?child=sophia` → KidDash
  - `/admindash` → AdminDash
  - `/lessonview?child=sophia&lesson=les-1` → LessonView
- **Old routes redirect** - `/dashboard`, `/admin`, `/curriculum`, `/manage` → `/admindash`

### Removed
- **Deleted views** - Removed old Tailwind-based views:
  - views/DaddyDashboardView.tsx
  - views/ChildDashboardView.tsx
  - views/ManageProfilesView.tsx
  - views/SubjectDetailView.tsx
  - views/AdminDashboardDemo.tsx
  - views/ChildDashboardDemo.tsx
  - views/LessonDemo.tsx
- **localStorage code** - Removed localStorage usage from App.tsx, LandingView

### Technical
- All styling inline (no Tailwind) - design system object + inline styles + GlobalStyles component

## 2026-02-20 - Version 3.4.1 (Firestore User Settings)

### Added
- **User settings to Firestore** - Admin profile (name, avatar, color, DOB) now stored in `/users/{uid}/settings/profile`
- **fetchUserSettings()** - Load user settings from Firestore on login
- **saveUserSettings()** - Save user settings to Firestore when edited

### Removed
- **localStorage usage** - Completely removed localStorage for user data:
  - App.tsx - Admin profile state now loads from Firestore
  - views/ManageProfilesView.tsx - Uses props instead of localStorage
  - views/LandingView.tsx - Removed parent email persistence
  - views/ChildDashboardView.tsx - Removed child profile persistence
  - src/lib/AuthContext.tsx - Removed INITIAL_DATA on sign out

### Changed
- **Routes** - Added `/landingview` route for new v6 LandingView
- **Inline view renamed** - Old `LandingView` renamed to `OldLandingView` to avoid shadowing

### Technical
- Build passes successfully
- User settings persist across sessions in Firestore

---

## 2026-02-19 - Version 3.4.0 (Complete Supabase Removal)

### Removed
- **Supabase dependencies** - Removed `@supabase/ssr` and `@supabase/supabase-js` from package.json
- **Supabase code** - Removed all Supabase references from codebase
- **Supabase schema** - Deleted `supabase_schema.sql`

### Refactored
- **Status indicator** - Renamed `supabaseStatus` to `dataStatus` throughout
- **Duplicate import** - Fixed duplicate `DaddyDashboardView` import in App.tsx
- **Type fix** - Fixed ViewOrigin comparison (`CHILD_DASHBOARD` → `KIDSDASH`)
- **Function args** - Fixed `hardDeleteSubjectFromFirebase` call with correct arguments
- **View wiring** - Wired up extracted views:
  - ChildDashboardView imported with full props
  - ManageProfilesView imported with full props  
  - ReturningView imported with props
  - DaddyDashboardView now used in render switch

### Technical
- All data now uses Firebase (Firestore + Auth)
- No localStorage fallback - Firebase-only persistence
- Build passes successfully
- **Code splitting** - Lazy loaded views (DaddyDashboardView, ChildDashboard, ManageProfilesView, ReturningView)
- **Bundle reduction** - Main bundle reduced from 675KB to 658KB via code splitting
- **Note** - Inline dead code (~500 lines) remains in App.tsx - extracted views work but inline versions not removed to avoid corruption

---

## 2026-02-19 - Version 3.3.1 (UI v6 Design System)

### Enhanced
- **v6 Design System Migration**
  - Updated CurriculumBuilder header with v6 styling
  - Updated LessonPlayer header and completion modal with v6 styling
  - Timeline component already uses design system

### Technical
- Design system components (Card, Shadow, Button, IconButton) now used in component headers
- Consistent typography with Baloo 2 and Nunito fonts

---

## 2026-02-18 - Version 3.4.0 (Refactor & Cleanup)

### Removed
- **Supabase** - Complete removal of Supabase backend
  - Deleted `supabase/` Edge Functions directory
  - Removed supabase chunk from vite.config.ts
  - Replaced all Supabase function calls with Firebase equivalents
  - Removed supabase status indicator and debug logging
  - Updated types.ts comment (now just "Database Types")

### Refactored
- **Code Organization**
  - Created `src/lib/helpers.ts` - Consolidated utility functions
    - `saveData()` - Unified save helper (Firebase/localStorage)
    - `exportDataToFile()` - Export curriculum to JSON
    - `importDataFromFile()` - Import curriculum from JSON
    - `generateUuid()` - UUID generation
    - `getGridCols()` - Grid column helper
  - Created `src/lib/handlers.ts` - Handler factory (partial)
  - Created `app/AdminAvatarEditModal.tsx` - Extracted modal component
  - Created `views/SubjectDetailView.tsx` - Extracted view (not yet wired)
  - Created `views/ReturningView.tsx` - Extracted view (not yet wired)

### Stats
- App.tsx: 3780 lines (down from 3921 originally)
- Removed ~140 lines of duplicate/supabase code
- Build passes successfully

---

## 2026-02-18 - Version 3.3.0 (UI v6 Design System)

### Added
- **Tab Shell** - Fixed top navigation bar with tabs (like v6 reference)
  - 🏠 Landing, 👤 Returning, 👨 Admin, 🧒 Kids, 🎬 Lesson
  - Active tab highlighted with dark ink background
  - Flat shadow on active tab, backdrop blur effect
- **Navigation Comments** - Added section markers in App.tsx for easy navigation
  - `// RETURNING VIEW (lines 1032-1255)`
  - `// SUBJECT DETAIL VIEW (lines 1257-1899)`
  - `// ADMIN VIEW (lines 1902-2653)`
  - `// KIDSDASH VIEW (lines 2655-2897)`
  - `// MANAGE PROFILES VIEW (lines 2899-3539)`
  - `// MAIN RENDER SWITCH (lines 3541-3636)`
- **Design System Components** (`components/design-system.tsx`)
  - `DS` - Design constants (cream background, dark ink, borders, radius)
  - `THEME_COLORS` - Blue, indigo, rose, emerald, amber, purple, pink, teal
  - `getThemeColor()` - Helper function for theme colors
  - `GlobalStyles` - Custom fonts (Baloo 2, Nunito) and animations
  - `Shadow` - Flat shadow component (no Tailwind shadows)
  - `Tag`, `Chip`, `SectionHead` - Label components
  - `Button` - Primary/secondary/ghost/danger variants with flat shadows
  - `IconButton` - Circular icon buttons
  - `Card`, `MiniCard` - Content containers with flat shadows
  - `Input` - Styled text input
  - `ProgressBar2` - Custom progress bar component
  - `Avatar` - Profile avatars with theme colors
  - `DropdownMenu`, `DropdownItem` - Menu components
  - `Texture`, `Blobs`, `Deco` - Background decorations

### Changed
- **View Naming** - Updated to match v6 reference:
  - `HOME` → `ADMIN` (Daddy Dashboard)
  - `CHILD_DASHBOARD` → `KIDSDASH`
  - `LESSON_PLAYER` → `LESSON`
- **New View** - Added `RETURNING` view for returning users
- **Visual Style** - Migrating from Tailwind to v6 design system:
  - Cream background (#FAF6F0) instead of gray-50
  - Dark ink color (#1A1A2E) instead of Tailwind grays
  - Flat shadows (solid offset shadows) instead of Tailwind shadows
  - Custom Baloo 2 / Nunito typography
  - Consistent border style (2.5px solid #1A1A2E)
  - Rounded corners (10/16/22px)

### Available Components
All components exported and ready to use in App.tsx:
```tsx
import { GlobalStyles, getThemeColor, DS, Shadow, Tag, Card, Button, 
  IconButton, Input, ProgressBar2, MiniCard, Avatar, 
  DropdownMenu, DropdownItem } from './components/design-system';
```

---

## 2026-02-14 - Version 3.2.0 (Child Sign-In & Profile Switching)

### Added
- **Google Email Field** - Edit profile now has "Google Account Email" field to link child's account
- **Auto Child Detection** - When child signs in with linked Google account, redirects to their dashboard
- **Parent Email Input** - Landing page has "For Kids" section where kids enter parent's email before signing in
- **Profile Switching** - Kids can switch to sibling profiles from dropdown menu
- **Dual Schedule** - Shows both kids' timetables side by side on child's dashboard
- **Dynamic Grid** - Profile cards auto-adjust columns (1-4 based on count)

### Changed
- **Profile Dropdown for Kids** - Shows sibling profiles + Sign Out (no admin dashboard)
- **Profile Dropdown for Admin** - Shows all options including Manage Profiles
- **Landing Title** - Changed to "Daddy Dashboard"
- **Profile Cards** - Now centered with max-w-xs for consistent sizing

### Fixed
- **Profile Switching** - Now loads sibling's full curriculum when switching
- **Cursor Focus** - Added autoFocus to email input field
- **Input Performance** - Removed onChange saving that was causing lag

---

## 2026-02-13 - Version 3.1.0 (Firebase Migration Complete)

### Added
- **Firebase Auth** - Replaced Supabase with Firebase Authentication
- **Firebase Firestore** - Data persistence using single document per child

### Removed
- **Supabase Admin Buttons** - Deduplicate, Nuke Supabase, Clean DB (kept local Dedupe Lessons)
- **Unused supabase.ts file** - Deleted legacy client

### Changed
- **User ID** - Changed `user.id` to `user.uid` (Firebase uses uid)
- **UI Labels** - "Supabase" renamed to "Firebase" throughout
- **Status Indicator** - Renamed state from `supabaseStatus` to `dataStatus`
- **Headers** - Added z-50 to sticky headers to fix icon overlap

### Fixed
- **Lesson Counts** - Now showing correctly on cards
- **Import/Export** - JSON import now saves to Firebase automatically

---

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
