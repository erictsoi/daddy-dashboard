# Daddy Dashboard - Development Log

> **Convention:** When "update logs" is requested:
> 1. Update CHANGELOG.md with changes
> 2. Update PROMPTS.md with context
> 3. Update this file with technical details
> 4. Bump version in package.json

---

## Current Version: 3.13.2

---

## Recent Changes (2026-02-26)

### v3.13.7 - Enhanced Expansion Animation
- **Expansion Scale**: Increased selection scale from 1.5x to 1.8x in `ReturningView.tsx` to match the "expand" feel.
- **Selection Timing**: Extended `setTimeout` navigation delay to 1500ms.
- **Consistency**: Synchronized expansion behavior with `LandingView.tsx`.
- **Version bump**: v3.13.7.
- **Build**: Successful production build.

### v3.13.6 - Typography Thickness Refinement
- **Faux Bold**: Implemented `text-shadow` based thickening for child names in `LandingView.tsx` and `ReturningView.tsx`.
- **Thickness**: Achieved ~125% extra thickness as requested while maintaining readability.
- **Version bump**: v3.13.6.
- **Build**: Successful production build.

### v3.13.5 - Card Layout & Typography Refinement
- **Metadata Alignment**: Aligned metadata rectangle text to the left in `ReturningView.tsx` to match `LandingView.tsx`.
- **Typographic Weight**: Increased card title `fontWeight` to `900` in both `LandingView.tsx` and `ReturningView.tsx`.
- **Version bump**: v3.13.5.
- **Build**: Successful production build.

### v3.13.4 - Benday Dot Standardization
- **Standardized `size` props**: Set default `size` to `3` in `Shadow` and `BendayShadow` components app-wide.
- **Global `Shadow` Restore**: Re-implemented `BendayShadow` within the global `Shadow` component in `design-system.tsx`.
- **Manual Gradient Sync**: Updated hardcoded `radial-gradient` backgrounds in `AdminDash.tsx` and `Marketplace.tsx` to match the new `3px` / `6.6px` (2.2x) standard.
- **Version bump**: v3.13.4.
- **Build**: Verified with `npm run build`.

### v3.13.3 - ReturningView Stacking Context Fix
**Completed:**
- ✅ Fixed shadow bounce synchronization by nesting logic inside animation container
- ✅ Implemented pixel-based scale compensation for benday dots
- ✅ Standardized LandingView header and footer styles to eliminate layout shifts

### v3.13.2 - LandingView Visual Refinement

**Completed:**
- ✅ Fixed shadow bounce synchronization by nesting logic inside animation container
- ✅ Implemented pixel-based scale compensation for benday dots
- ✅ Standardized LandingView header and footer styles to eliminate layout shifts
- ✅ Locked shadow offset to constant 4px for stability
- ✅ Updated `ReturningView` with consistent v6 design system components

---

## Recent Changes (2026-02-25)

### v3.4.1 - Firestore User Settings

**Completed:**
- ✅ Added `fetchUserSettings()` and `saveUserSettings()` to `dataService.ts`
- ✅ User settings stored in `/users/{userId}/settings/profile`
- ✅ Removed localStorage from App.tsx (admin profile state now from Firestore)
- ✅ Removed localStorage from views/ManageProfilesView.tsx
- ✅ Removed localStorage from views/LandingView.tsx
- ✅ Removed localStorage from views/ChildDashboardView.tsx
- ✅ Removed localStorage from src/lib/AuthContext.tsx
- ✅ Added `/landingview` route for new v6 LandingView
- ✅ Renamed old inline LandingView to OldLandingView

### v6 Design System Migration

**Completed:**
- ✅ `components/design-system.tsx` - Shadow component with proper boxShadow
- ✅ `views/LandingView.tsx` - Fully migrated to v6
- ✅ `views/ReturningView.tsx` - Fully migrated to v6
- ✅ `views/AdminDashboardDemo.tsx` - New component based on FINAL.jsx
- ✅ `views/ChildDashboardDemo.tsx` - New component based on FINAL.jsx
- ✅ `views/LessonDemo.tsx` - New component based on FINAL.jsx
- ✅ `views/SubjectDetailView.tsx` - Header uses v6
- ✅ `views/ManageProfilesView.tsx` - Header uses v6

**Views with Nav Buttons (Testing):**
- ✅ LandingView - Dashboard, Manage
- ✅ ReturningView - Landing, Dashboard
- ✅ AdminDashboardDemo - Landing, Returning, Admin, Sophia, Adrian, Curriculum, Lesson
- ✅ ChildDashboardDemo - Landing, Returning, Admin, Sophia, Adrian, Curriculum, Lesson
- ✅ LessonDemo - Landing, Returning, Admin, Sophia, Adrian, Curriculum, Lesson
- ✅ SubjectDetailView - Landing, Sophia, Adrian, Lesson
- ✅ ManageProfilesView - Landing, Back, Lesson

**Data Population:**
- ✅ `constants.ts` - Populated with 6 profiles from FINAL.jsx:
  - Amara (Year 1) - 🦋
  - Marcus (Year 3) - 🦖
  - Sophia (Year 5) - 🎨
  - Kai (Year 7) - 🛹
  - Adrian (Year 9) - 🏀
  - Rohan (Year 11) - 📸

**URL Routing:**
- ✅ IMPLEMENTED - React Router DOM with URL-based routes
- Routes:
  - `/` - Landing page
  - `/returning` - Returning user view
  - `/dashboard` or `/admin` - Daddy Dashboard
  - `/manage` - Manage Profiles
  - `/curriculum` - Curriculum Builder
  - `/child/:childId` - Child Dashboard
  - `/child/:childId/subject/:subjectId` - Subject Detail
  - `/child/:childId/subject/:subjectId/topic/:topicId/lesson/:lessonId` - Lesson Player

---

## Technical Reference

### Reference Files
- **`daddy_dashboard_FINAL.jsx`** - Complete v6 design reference
- **`components/design-system.tsx`** - v6 design system components

### Tech Stack
- React 19 + Vite
- TypeScript
- Tailwind CSS (v4)
- Firebase (Firestore, Auth)
- lucide-react

### Routing
- URL-based routing with React Router DOM
- URL syncs with view state via useEffect
- Navigation uses `navigate()` instead of `setView()`

---

## View Status

| View | Tailwind | v6 Design | Nav Buttons | Notes |
|------|----------|-----------|------------|-------|
| LandingView | ✅ | ✅ | ✅ | Dashboard, Manage |
| ReturningView | ✅ | ✅ | ✅ | Landing, Dashboard |
| AdminDashboardDemo | ✅ | ✅ | ✅ | Demo component |
| ChildDashboardDemo | ✅ | ✅ | ✅ | Demo component |
| LessonDemo | ✅ | ✅ | ✅ | Demo component |
| SubjectDetailView | ✅ | ✅ | ✅ | Header v6 |
| ManageProfilesView | ✅ | ✅ | ✅ | Header v6 |
| ChildDashboardView | ❌ | ❌ | ✅ | Old Tailwind version |
| DaddyDashboardView | ✅ | ✅ | ❌ | Uses v6 design |

---

## Migration Phases

### Phase 1: Foundation (Completed ✅)
- [x] Create design-system.tsx with all components
- [x] Add typography (Baloo 2, Nunito)
- [x] Add animations
- [x] Import into App.tsx
- [x] Test build passes

### Phase 2: Header/Nav Updates (Completed ✅)
- [x] Update LandingView header + nav buttons
- [x] Update ReturningView header + nav buttons
- [x] Update AdminDashboardDemo header + nav buttons
- [x] Update ChildDashboardDemo header + nav buttons
- [x] Update LessonDemo header + nav buttons
- [x] Update SubjectDetailView header + nav buttons
- [x] Update ManageProfilesView header + nav buttons
- [x] Standardize benday dots across the application
- [x] Increase benday dot size to 3px for a premium look
- [x] Verify visual consistency across all views
- [x] Align metadata to the left in `ReturningView.tsx`
- [x] Embolden card titles in `LandingView.tsx` and `ReturningView.tsx` (fontWeight 900)
- [x] Verify changes and update version to v3.13.5
- [x] Push changes to GitHub
- [x] Add Sophia/Adrian specific nav buttons

### Phase 3: Demo Views (Completed ✅)
- [x] Created AdminDashboardDemo with collapsible sidebar, schedule cards, progress bars
- [x] Created ChildDashboardDemo with dynamic data, schedule timeline, subject cards
- [x] Created LessonDemo with video player, playlist sidebar, outcomes

### Phase 4: URL Routing (NOT IMPLEMENTED)
- URL routing requires significant refactoring. Deferred to future session.

---

## Implementation Guidelines

### When Updating a View

1. **Start Simple** - Begin with header/nav areas
2. **Use Components** - Prefer design system components
3. **Test Build** - Run `npm run build` after changes
4. **Keep Backup** - Save original if complex

### Component Usage

```tsx
// Good - Use design system
<Card style={{ padding: 24 }}>
  <h2 className="b t-h2" style={{ color: DS.ink }}>Title</h2>
</Card>

// Avoid - Tailwind classes for layout
<div className="p-6 bg-white rounded-xl shadow-lg">
```

### Style Patterns

```tsx
// Background
style={{ background: DS.cream }}  // Cream

// Text  
style={{ color: DS.ink }}           // Dark ink
style={{ color: DS.inkSoft }}      // Muted

// Borders
style={{ border: DS.border }}      // 2.5px solid #1A1A2E

// Radius
style={{ borderRadius: DS.radius.md }}  // 16px

// Theme colors
const colors = getThemeColor(child.themeColor);
style={{ background: colors.main }}
style={{ background: colors.tint }}
```

---

## Design System Components

| Component | Purpose |
|-----------|---------|
| `Shadow` | Flat shadow wrapper |
| `FlatShadow` | Simpler shadow variant |
| `Tag` | Pill-shaped labels |
| `Chip` | Icon + value + label |
| `SectionHead` | Section headers with decorative line |
| `Button` | Primary/secondary/ghost/danger variants |
| `IconButton` | Circular icon buttons |
| `Card` | Content container |
| `MiniCard` | Grid card for subjects/topics |
| `Input` | Styled text input |
| `ProgressBar2` | Custom progress bar |
| `Avatar` | Profile avatars |
| `DropdownMenu` | Dropdown container |
| `Texture` | Dot pattern background |
| `Blobs` | Color blob decorations |
| `Deco` | Decorative emojis |

---

## Firebase Migration (Complete)

### Architecture
- **Firebase Firestore** - Single document per child: `/users/{userId}/children/{childId}`
- **Firebase Auth** - Google OAuth
- **Offline persistence** - Enabled via `enableIndexedDbPersistence`

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase config, auth, Firestore init |
| `src/lib/dataService.ts` | CRUD operations for Firebase |
| `src/lib/AuthContext.tsx` | Firebase auth context |

### Supabase Removal (v3.4.0)
- Removed `@supabase/ssr` and `@supabase/supabase-js`
- Firebase-only now
- Renamed `supabaseStatus` → `dataStatus`

---

## YouTube Playlist Import

### Data Flow
```
Paste/URL Input → Parse → Clean URL → Process (API/Scraper) → Expand → Import
```

### Fallback Chain (for playlist scraping)
1. YouTube Data API (with VITE_YOUTUBE_API_KEY)
2. KNOWN_PLAYLISTS cache (hardcoded)
3. CORS proxies (r.jina.ai, allorigins, corsproxy.io)

### Table Format (Paste Mode)
| Column | Field |
|--------|-------|
| 1 | childName |
| 2 | yearGroup |
| 3 | subjectCategory |
| 4 | subjectName |
| 5 | lessonTitle |
| 6 | notes |
| 7 | videoUrl |

---

## Profile Management

### Child Sign-In Updates
- ✅ Google email field added to EditProfile component
- ✅ linkedAccounts collection for child-parent linking
- ✅ fetchChildByEmail returns all children for dual schedule
- ✅ Parent email input on landing page (For Kids section)
- ✅ Profile switching with full curriculum loading
- ✅ Dual schedule on child dashboard using Timeline component
- ✅ Dynamic grid columns based on card count (1-4)

### Schedule Generation
- Each child can start their day independently
- Schedule randomly generated based on curriculum
- Breaks and lunch synchronized across all children

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000+) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Known Issues

### Complex Views to Avoid (JSX Complexity)
The following views have complex nested JSX that causes issues when migrating:
- SubjectDetailView (500+ lines, many conditional renders)
- LessonPlayerView (video player integration)
- CurriculumBuilderView (forms, tables, modals)
- ManageProfilesView (many form states)

**Recommendation:** Keep these as Tailwind for now, or rewrite completely.

### Workaround: Hybrid Approach
Keep Tailwind for complex views while using v6 for:
- New components
- Header/nav areas
- Card wrappers
- Typography

---

## Next Steps

1. Implement URL routing (optional - requires significant changes)
2. Connect demo views to real Firebase data
3. Continue styling remaining views with v6
4. Add browser history support
5. ChildDashboardView - Migrate to v6 design

---

## History

### v3.4.0 - Complete Supabase Removal (2026-02-19)
- Removed `@supabase/ssr` and `@supabase/supabase-js` from package.json
- Firebase-only now
- Removed `const supabase = null` shim from App.tsx
- Renamed `supabaseStatus` → `dataStatus` throughout

### v6 Design System Phase 2 & 3 (2026-02-19)
- Updated `CurriculumBuilder.tsx` header with v6 design
- Updated `LessonPlayer.tsx` header and completion modal
- Timeline component: Already using design system
- Complex card areas: Skipped (complex nested JSX)

### Tab Shell & Navigation (2026-02-18)
- Added fixed top navigation bar matching v6 reference
- Added navigation comments in App.tsx for easy reference

### v3.3.0 - React 19 Upgrade
- Updated to React 19
- Updated to Vite 6
- Removed unused dependencies

### Firebase Migration (2026-02-14)
- Migrated from Supabase to Firebase
- Created `src/lib/firebase.ts` and `dataService.ts`
- Implemented Google OAuth
- Added offline persistence

### Child Sign-In (2026-02-14)
- Added Google email field to profiles
- Implemented linkedAccounts collection
- Added parent email input for kids
- Dual schedule support

---

## File Structure

```
src/
├── lib/
│   ├── firebase.ts          # Firebase config, auth
│   ├── dataService.ts       # Firestore CRUD operations
│   └── AuthContext.tsx      # Firebase auth context
├── components/
│   ├── design-system.tsx   # v6 design system
│   └── ...
└── views/
    ├── LandingView.tsx     # v6 design
    ├── ReturningView.tsx    # v6 design
    ├── AdminDashboardDemo.tsx    # NEW v6 demo
    ├── ChildDashboardDemo.tsx    # NEW v6 demo
    ├── LessonDemo.tsx       demo
    └── ...
```

---

* # NEW v6Last Updated: 2026-02-20*
