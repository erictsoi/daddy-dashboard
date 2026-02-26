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
