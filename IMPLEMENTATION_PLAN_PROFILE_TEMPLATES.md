# Daddy Dashboard - Profile Template Schema Implementation Plan

## Overview
Add profile-based curriculum templates to existing child schema. Parents select age-appropriate template → customize with child name/interests → curriculum stacks load automatically.

## Current State (Preserved)
- Landing page, ReturningView, AdminDash, KidDash - COMPLETE
- Current schema: ChildProfile → YearGroup → Subject → Topic → Lesson
- Firebase: users/{userId}/children/{childId}

## Changes Required

### 1. New Types (src/types.ts)
```typescript
// Profile Templates (6 UK Year Groups)
type ProfileTemplate = 'Y1-2' | 'Y3-4' | 'Y5-6' | 'Y7-8' | 'Y9-10' | 'Y11-12'

// Stack Types (7 Subject Stacks - ALREADY DEFINED)
type StackType = 
  | 'coreAcademics' 
  | 'languages' 
  | 'creativePerforming' 
  | 'stemDigital' 
  | 'physicalWellbeing' 
  | 'characterEnrichment' 
  | 'additionalSubjects'

// Curriculum Card (replaces Topic for template mode)
interface CurriculumCard {
  id: string
  focus: string           // e.g., "Phonics & stories"
  primaryPlaylist: string // YouTube playlist URL
  backupPlaylist1?: string
  backupPlaylist2?: string
  notes?: string
  approved: boolean
}

// Stack (group of cards)
interface CurriculumStack {
  type: StackType
  cards: CurriculumCard[]
}

// Profile Template Data
interface ProfileTemplateData {
  template: ProfileTemplate
  customName?: string
  interests?: string[]
  stacks: CurriculumStack[]
  approved: boolean
  createdAt: string
}

// Add to existing ChildProfile
interface ChildProfile {
  // ... existing fields
  profileTemplate?: ProfileTemplate       // e.g., "Y5-6"
  profileData?: ProfileTemplateData        // Full stack data if using template mode
}
```

### 2. Stack Mapping (src/constants.ts)
```typescript
export const STACK_TYPES = [
  'coreAcademics',
  'languages',
  'creativePerforming',
  'stemDigital',
  'physicalWellbeing',
  'characterEnrichment',
  'additionalSubjects'
] as const

export const PROFILE_TEMPLATES: { id: ProfileTemplate; label: string; ageRange: string; avatar: string }[] = [
  { id: 'Y1-2', label: 'Y1/2 Child', ageRange: '5-7 years', avatar: '🧒' },
  { id: 'Y3-4', label: 'Y3/4 Child', ageRange: '7-9 years', avatar: '👦' },
  { id: 'Y5-6', label: 'Y5/6 Child', ageRange: '9-11 years', avatar: '👧' },
  { id: 'Y7-8', label: 'Y7/8 Child', ageRange: '11-13 years', avatar: '🧑' },
  { id: 'Y9-10', label: 'Y9/10 Child', ageRange: '13-15 years', avatar: '👱' },
  { id: 'Y11-12', label: 'Y11/12 Child', ageRange: '15-17 years', avatar: '🎓' }
]

// Default stack mapping per profile (can be customized)
export const DEFAULT_STACKS: Record<ProfileTemplate, CurriculumStack[]> = {
  'Y1-2': [
    { type: 'coreAcademics', cards: [] },
    { type: 'languages', cards: [] },
    { type: 'creativePerforming', cards: [] },
    { type: 'stemDigital', cards: [] },
    { type: 'physicalWellbeing', cards: [] },
    { type: 'characterEnrichment', cards: [] },
    { type: 'additionalSubjects', cards: [] }
  ],
  // ... repeat for other profiles
}
```

### 3. CurriculumBuilder Updates (src/components/CurriculumBuilder.tsx)
```typescript
// Add third import mode
type InputMode = 'paste' | 'playlist' | 'template'

// Template Mode parses 7 columns:
/*
Profile | Subject | YT Playlist Focus | Primary YT Playlist | Backup 1 | Backup 2 | Notes
Y1/2 Child | English | Phonics & stories | https://youtube.com/playlist?list=PL... | https://... | https://... | Blending sounds...
*/

// Maps to:
interface ParsedTemplateRow {
  profile: string      // "Y1/2 Child" → profileTemplate
  subject: string       // "English" → stack category
  focus: string        // "Phonics & stories" → card.focus
  primaryPlaylist: string
  backupPlaylist1?: string
  backupPlaylist2?: string
  notes: string
}
```

### 4. DataService Updates (src/lib/dataService.ts)
- Add `saveProfileTemplate()` - saves template selection
- Add `updateChildTemplate()` - links child to profile template
- Add `fetchProfileTemplates()` - gets all templates for user
- Add `approveStackCard()` - marks card as approved
- Update `toChildProfile()` mapper to include new fields

### 5. YouTube Parser Updates (src/utils/youtube.ts)
- Add fallback logic: Primary → Backup1 → Backup2
- Cache parsed results

## Firebase Structure
```
users/{userId}/
  children/{childId}/
    - name: "Sophia"
    - profileTemplate: "Y5-6"
    - profileData: {
        customName: "Sophia"
        interests: ["Science", "Art"]
        stacks: {
          coreAcademics: { cards: [...] }
          languages: { cards: [...] }
          creativePerforming: { cards: [...] }
          stemDigital: { cards: [...] }
          physicalWellbeing: { cards: [...] }
          characterEnrichment: { cards: [...] }
          additionalSubjects: { cards: [...] }
        }
        approved: true
      }
```

## Implementation Order

### Step 1: Types (15 min)
- [ ] Add ProfileTemplate, CurriculumCard, CurriculumStack, ProfileTemplateData types
- [ ] Update ChildProfile interface

### Step 2: Constants (20 min)
- [ ] Create STACK_TYPES, PROFILE_TEMPLATES, DEFAULT_STACKS
- [ ] Define 7 existing stack types

### Step 3: DataService (45 min)
- [ ] Add template-related functions
- [ ] Update mappers

### Step 4: CurriculumBuilder (60 min)
- [ ] Add "Template Mode" import tab (3rd mode alongside Spreadsheet/Playlist)
- [ ] Parse new 7-column format: Profile | Subject | Focus | Primary | Backup1 | Backup2 | Notes
- [ ] Map to stack cards and save to profileData.stacks
- [ ] Keep existing modes for backward compatibility (delete later)

### Step 5: YouTube Integration (30 min)
- [ ] Add fallback logic: Primary → Backup1 → Backup2

## Files to Modify
1. `src/types.ts` - Add new interfaces
2. `src/constants.ts` - Add STACK_TYPES, PROFILE_TEMPLATES, DEFAULT_STACKS
3. `src/lib/dataService.ts` - Add template functions
4. `src/components/CurriculumBuilder.tsx` - Add Template import mode

## Estimated Time
- Types + Constants: 35 min
- DataService: 45 min
- CurriculumBuilder: 60 min
- YouTube: 30 min
- **Total: ~2.5 hours**

## Success Criteria
- [ ] New children can select profile template
- [ ] Template stacks map to 7 existing stack categories
- [ ] 7-column import creates stack cards correctly
- [ ] YouTube playlists parse from Primary → Backup fallback works
- [ ] Old import modes still work (can delete later)
