## 2026-03-05 - v3.15.0 - Curriculum Expansion & Hub Import

### Added
- **Curriculum Library**: New "Import from Applet" feature to import JSON curriculum data from external tools.
- **Curriculum Search**: Integrated API Key status panel with missing key warnings and instructions.
- **Curriculum Search**: Added "Daddy's Learning Goals" and "Curriculum Mapping" sections to vividly display curriculum focus.
- **Year Groups**: Expanded data coverage for Y1-2, Y3-4, Y10-11, and Y12-13 with generated placeholder subject cards.
- **Hooks**: Modularized data layer by splitting `useAppData` into `useSettingsData`, `useChildData`, and `useLessonData`.
- **UI**: Implemented a premium `LoadingFallback` component with centered spinner and themed background.

### Changed
- **Curriculum Search**: "Find Videos" search preview now strictly targets exact topic recommendations derived from the `ukCurriculum.ts` file, drastically improving finding valid educational playlists.
- **Curriculum Data**: Detailed topics, goals, and focus elements within `ukCurriculum.ts` now perfectly mirror the verified `UK_CURRICULUM.md` source of truth.
- **Performance**: Implemented dynamic dynamic (lazy) loading for large subject card JSON files to reduce initial bundle size.
- **UK Curriculum**: Enriched all year groups with granular topics and detailed descriptions for better search context.
- **Search Logic**: Refined Y7-9 Music search terms to prioritize generic performance playlists over specific curriculum codes.
- **Architecture**: Refactored `useAppData` to act as a unified Facade for modular child/lesson/settings hooks.

---

## 2026-03-04 - v3.14.3 - Bug Fixes

### Fixed
- **LessonPlayer.tsx**: Added missing `text600` to themeColors
- **ProfileSwitcher.tsx**: Now uses dynamic theme colors instead of hardcoded values
- **CurriculumValidator.tsx**: Added try/catch around localStorage parse
- **dataService.ts**: Changed `||` to `??` for zero-value fields (timeSpentSeconds, videoPosition, orderIndex)
- **dataService.ts**: Replaced fragile ID length check with proper UUID validation
- **ChildManagement.tsx**: Preserved googleEmail when editing child profiles
- **SubjectFields.tsx**: Replaced useMemo with useEffect for side effect (clearConfigs)
- **SubjectFields.tsx**: Removed duplicate normalizeYearGroup function
- **SubjectPickerModal.tsx**: Removed duplicate normalizeYearGroup function
- **utils/subjects.ts**: Consolidated normalizeYearGroup function
- **useAppData.ts**: Fixed year group identifiers (Y7-8→Y7-9, Y9-10→Y10-11, Y11-12→Y12-13)
- **EditProfile.tsx**: Removed duplicate avatars from AVATARS array
- **dataService.ts**: Removed unused PATHS constant
- **types.ts**: Removed unused Db* types (DbProfile, DbChild, DbYearGroup, DbSubject, DbTopic, DbLesson, DbCuratedPlaylist) and joined types
- **demoProfiles.ts**: Reordered profiles (Amara, Marcus, Sophia, Adrian, Kai, Rohan)
- **KidDash.tsx**: Changed subjects grid from 2 to 5 columns
- **SubjectFields.tsx**: Removed "Core Subjects" and "Optional Subjects" headings
- **SubjectFields.tsx**: Combined name and year in header ("ROHAN'S SUBJECTS Y12-13")
- **SubjectFields.tsx**: Removed fallback to curriculum data (now only uses real JSON data)
- **SubjectFields.tsx**: Clear dummy configs on init
- **youtube.ts**: Added apiKey parameter to searchYouTubePlaylists

### Changed
- **SubjectCards grid**: 5 columns on KidDash, auto-fill on AdminDash
- **LandingView**: Profile card order is Amara → Marcus → Sophia → Adrian → Kai → Rohan

---

## 2026-02-27 - v3.14.2 - Admin Card Image

### Added
- **Admin Card Image**: Added profile image for admin card (`/profile-pics/Admin.jpg`)

---

## 2026-02-27 - v3.14.1 - Card Alignment & Command Palette

### Added
- **CommandPalette Component**: New design system component with modal UI, search input, and command list
- **useCommandPalette Hook**: React hook with keyboard shortcuts (Cmd+Shift+P / Ctrl+Shift+P), escape to close
- **openRouter.ts**: New lib for OpenRouter AI API integration with model fetching and chat completions

### Changed
- **ReturningView Card Positions**: Reduced randomness - y offset from 4-16px to 2-8px, rotation from 1.5-6° to 0.5-2.5°, initial offsets halved

---

## 2026-02-26 - v3.14.0 - Subject Categories & Colors

### Added
- **7 Subject Categories**: Core Learning, Science, Languages, Creative, STEM & Digital, Physical & Life, Additional
- **Category Badges**: Each subject card now displays its category label with colored background
- **Category Sorting**: Subjects sorted by category order in admin dashboard
- **Default Subjects List**: Ordered default subjects exported from `utils/subjects.ts`
- **Extra Subjects Picker**: Preset options for additional subjects (Extra Languages, Economics, Media, Coding, Dance, Debate, Exam Prep, Custom)

### Changed
- **Saturated Colors**: More vibrant subject colors (red, blue, orange, purple, green, yellow)
- **Grid Layout**: 5-column grid for subject cards in admin dashboard

### Technical
- **New Exports**: `getSubjectCategory`, `getSubjectCategoryLabel`, `SUBJECT_BUCKET_ORDER`, `DEFAULT_SUBJECTS`, `EXTRA_SUBJECTS`
- **Category Colors**: Updated `CATEGORY_COLORS` with saturated palette

---

## 2026-02-26 - v3.13.8 - Faux Bold & Animation Fixes
- **Faux Bold**: Applied `text-shadow` to child names for extra thickness (~125% boost).
- **Animation Fix**: Removed `bounce-card` CSS conflict in `ReturningView.tsx`.
- **Scaling**: Standardized expansion scale to 1.5x in `ReturningView.tsx` to match `LandingView.tsx`.
- **Build**: Successful production build.

## 2026-02-26 - v3.13.7 - Enhanced Expansion Animation
- **Interactions**: Upgraded the card selection expansion in `ReturningView.tsx` to match the dramatic feel of `LandingView.tsx`.
- **Scaling**: Increased selected card scale to 1.8x.
- **Timing**: Extended navigation delay to 1500ms for a smoother, more premium transition.

## 2026-02-26 - v3.13.6 - Typography Thickness Refinement
- **Faux Bold**: Implemented `text-shadow` based thickening for child names in `LandingView.tsx` and `ReturningView.tsx`.
- **Thickness**: Achieved ~125% extra thickness as requested while maintaining readability.
- **Version bump**: v3.13.6.

## 2026-02-26 - v3.13.5 - Card Layout & Typography Refinement
- **Metadata Alignment**: Aligned metadata rectangle text to the left in `ReturningView.tsx`.
- **Typographic Weight**: Increased card title `fontWeight` to `900` in both `LandingView.tsx` and `ReturningView.tsx`.
- **Version bump**: v3.13.5.

## 2026-02-26 - v3.13.4 - Benday Dot Standardization
- **Visuals**: Enlarged benday dots to `3px` across all components and views for better contrast and premium feel.
- **Design System**: Restored benday dots to global `Shadow` component in `design-system.tsx`.
- **Consistency**: Synchronized dot sizes in `LandingView`, `ReturningView`, `KidDash`, `AdminDash`, `LessonView`, `TempGridView`, and `Marketplace`.
- **Refinement**: Fixed unused import in `Marketplace.tsx`.

## 2026-02-26 - v3.13.3 - ReturningView Card Stack Fix
- **Admin card stacking** - Admin now on top of stack (zIndex: 7), others stacked below in order
- **Benday dot shadow** - Changed to div with inset:-3 and zIndex:-1 to render behind cards
