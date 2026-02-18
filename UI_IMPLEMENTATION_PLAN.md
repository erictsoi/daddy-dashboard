# UI Implementation Update Plan

## Overview

This document outlines the plan to migrate Daddy Dashboard from Tailwind CSS to the v6 Design System while maintaining functionality.

---

## Current State

### Design System (Completed ✅)
- `components/design-system.tsx` created with all v6 components
- Typography classes (Baloo 2, Nunito)
- Animation keyframes
- Imported in App.tsx
- Available for all views

### Views Status

| View | Tailwind | v6 Design | Notes |
|------|----------|-----------|-------|
| LandingView | ✅ | ✅ | Already uses v6 (separate file) |
| DaddyDashboardView | Partial | Partial | Header updated |
| ChildDashboardView | Partial | Partial | Header updated |
| SubjectDetailView | ✅ | ❌ | Complex nested JSX |
| LessonPlayerView | ✅ | ❌ | Complex nested JSX |
| CurriculumBuilderView | ✅ | ❌ | Complex nested JSX |
| ManageProfilesView | ✅ | ❌ | Complex nested JSX |

---

## Migration Phases

### Phase 1: Foundation (Completed)
- [x] Create design-system.tsx with all components
- [x] Add typography (Baloo 2, Nunito)
- [x] Add animations
- [x] Import into App.tsx
- [x] Test build passes

### Phase 2: Header/Nav Updates (In Progress)
- [x] Update DaddyDashboard header
- [x] Update ChildDashboard header
- [x] Update SubjectDetail header
- [x] Update CurriculumBuilder header
- [x] Update LessonPlayer header

### Phase 3: Card Components
- [x] Timeline - Already uses design system
- [ ] DaddyDashboard cards - Complex JSX, skipped
- [ ] ChildDashboard cards - Complex JSX, skipped
- [ ] SubjectDetail topic cards - Complex JSX, skipped

### Phase 3 Notes
Complex nested JSX in these views makes migration risky. Recommend keeping Tailwind for these areas:
- DaddyDashboard subject grid (map within map)
- ChildDashboard cards (map within map within conditional)
- SubjectDetail topic cards (complex conditional rendering)

### Phase 4: Form Components
- [ ] Update ManageProfiles forms
- [ ] Update CurriculumBuilder inputs
- [ ] Update LessonPlayer controls

### Phase 5: Cleanup
- [ ] Remove unused Tailwind classes
- [ ] Remove Tailwind dependency
- [ ] Verify all functionality

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

## Testing Checklist

After each update:

- [ ] Build passes: `npm run build`
- [ ] Dev server works: `npm run dev`
- [ ] Navigation works between all views
- [ ] Profile dropdown functions
- [ ] Forms can submit
- [ ] Data persists correctly

---

## Files Reference

### Design System
- `components/design-system.tsx` - All v6 components

### Views (App.tsx)
- DaddyDashboardView (lines ~1849+)
- ChildDashboardView (lines ~2443+)
- SubjectDetailView (lines ~1202+)
- LessonPlayerView (lines ~1661+)
- CurriculumBuilderView (lines ~1913+)
- ManageProfilesView (lines ~2602+)

### Separate View Files
- `views/LandingView.tsx` - Already v6 styled

---

## Future Enhancements

### Animations
- Add staggered card entrance animations
- Add hover effects on buttons
- Add loading states

### Components to Add
- Modal component
- Toast/notification component
- Skeleton loading states

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-19 | 3.3.1 | Phase 2: CurriculumBuilder, LessonPlayer headers updated |
| 2026-02-18 | 3.3.0 | Design system created, foundation laid |
