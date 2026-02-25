# Changelog

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
