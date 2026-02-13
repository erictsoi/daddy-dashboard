# Daddy Dashboard - Firebase Migration Implementation Roadmap

## Overview
Migrating from Supabase to Firebase to fix loading issues and simplify data structure.

---

## PHASE 1: Firebase Setup (COMPLETE)

### 1.1 Files Created
| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase config, auth, Firestore init |
| `src/lib/dataService.ts` | CRUD operations for Firebase |

### 1.2 Files Modified
| File | Changes |
|------|---------|
| `src/lib/AuthContext.tsx` | Replaced Supabase auth with Firebase Auth |
| `App.tsx` | Updated imports, function signatures |
| `types.ts` | Added `youtubeUrls`, `focus`, `notes` to Topic type |

### 1.3 Review Needed
- [ ] Test Google login works
- [ ] Test data loads from Firebase
- [ ] Verify no remaining Supabase references break functionality

### 1.4 Key Decisions
- Using single document per child: `/users/{userId}/children/{childId}`
- Full curriculum stored in one document per child
- Offline persistence enabled via `enableIndexedDbPersistence`

---

## PHASE 2: Clean Up Remaining Supabase References (IN PROGRESS)

### 2.1 App.tsx Admin Functions (LINES 2138-2356)
These admin features still use Supabase directly:
- `checkForDuplicates()` - LINE 2138
- `cleanupOrphanedData()` - LINE 2168
- `deleteAllData()` - LINE 2202
- `cleanupDuplicateLessons()` - LINE 2285
- `cleanupDuplicateTopics()` - LINE 2305
- `cleanupDuplicateSubjects()` - LINE 2324
- `cleanupDuplicateYearGroups()` - LINE 2343

**STATUS:** These are admin/debug functions. Can be disabled or rewritten for Firebase.

### 2.2 CurriculumBuilder.tsx
**STATUS:** Fixed - now uses `utils/youtube.ts` instead of Supabase.

### 2.3 Other Files to Check
```bash
grep -r "supabase" --include="*.ts" --include="*.tsx"
```

---

## PHASE 3: Card Display Fixes

### 3.1 Problem
Mobile shows wrong number of lessons per card.

### 3.2 Location
- `App.tsx` lines ~2965 (Child Dashboard)
- `App.tsx` lines ~2620 (Daddy Dashboard)

### 3.3 Current Code
```typescript
// Current - counts from lessons array
const allLessons = subject.topics.flatMap(t => t.lessons);
const totalCount = allLessons.filter(l => !l.deleted).length;
```

### 3.4 Expected Behavior
- Each topic card shows lesson count from `topic.lessons.length`
- If Firebase loads correctly, this should auto-fix

### 3.5 Test Checklist
- [ ] Login as admin
- [ ] Check topic cards show correct lesson counts
- [ ] Test on mobile viewport
- [ ] Verify count = actual lessons in topic

---

## PHASE 4: Import Your Table Data

### 4.1 Your Data Summary
| Field | Count |
|-------|-------|
| Children | 2 (Adrian, Sophia) |
| Years | 4 (Y5, Y6, Y9, Y10) |
| Rows | ~80 |
| Topics | ~30+ |
| Duplicates | Basketball repeated 5x per child |

### 4.2 Schema Mapping
| Table Column | Firestore Field |
|--------------|-----------------|
| Child | `child.name` |
| Year | `yearGroup.name` (e.g., "Year 5") |
| Subject | `subject.name`, `subject.category` |
| Subcategory | `topic.name` |
| Video Link | `topic.youtubeUrls[]` (array for multiple URLs) |
| YT Playlist Focus | `topic.focus` |
| Notes | `topic.notes` |

### 4.3 Import Strategy
1. Parse each row
2. Find or create child
3. Find or create year group
4. Find or create subject
5. Find or create topic
6. Add YouTube URL to `topic.youtubeUrls[]`
7. Later: expand URLs to `topic.lessons[]` when needed

### 4.4 Implementation Location
- Could be a one-time script
- Or add "Import from Table" button to CurriculumBuilder

### 4.5 Test Checklist
- [ ] Import table data
- [ ] Verify all children exist
- [ ] Verify all years exist
- [ ] Verify topic cards show correct counts
- [ ] Test video playback

---

## PHASE 5: Firebase Security Rules

### 5.1 Current Status
Database is in **Test Mode** (allows all read/write for 30 days).

### 5.2 Production Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/children/{childId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5.3 Action Needed
Deploy rules when ready for production.

---

## PHASE 6: Testing Checklist

### 6.1 Pre-Deployment
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors

### 6.2 Login Tests
- [ ] Google login works
- [ ] Logout works
- [ ] State resets on logout

### 6.3 Data Tests
- [ ] Data saves to Firebase
- [ ] Data loads from Firebase
- [ ] Offline persistence works

### 6.4 UI Tests
- [ ] Lesson counts correct on desktop
- [ ] Lesson counts correct on mobile
- [ ] Cards display correctly
- [ ] Video playback works

---

## KEY FILES REFERENCE

### Core Files
| File | Purpose |
|------|---------|
| `App.tsx` | Main app, all views |
| `types.ts` | TypeScript interfaces |
| `src/lib/firebase.ts` | Firebase init |
| `src/lib/dataService.ts` | Data CRUD |
| `src/lib/AuthContext.tsx` | Auth handling |
| `utils/youtube.ts` | YouTube URL processing |
| `components/CurriculumBuilder.tsx` | Import UI |

### Data Flow
```
User Login (Firebase Auth)
    ↓
App.tsx useEffect → fetchChildren(user.id)
    ↓
dataService.ts fetchChildren()
    ↓
Firestore: /users/{userId}/children/{childId}
    ↓
Returns ChildProfile[]
    ↓
Render: Child Dashboard / Daddy Dashboard
```

---

## DECISIONS MADE

1. **Single Document per Child**: Store full child data in one Firestore document
   - Pro: Simple, 1 read per child
   - Con: Large docs (mitigated by not storing video content)

2. **youtubeUrls Array**: Store raw YouTube URLs in topic
   - Allows multiple playlists/videos per topic
   - Expand to lessons when displaying

3. **Keep Existing YouTube Processing**: Use existing `utils/youtube.ts`
   - Already handles playlist scraping
   - Works without API key (mostly)

---

## TROUBLESHOOTING

### "Wrong lesson count" on mobile
1. Check Firebase has correct data
2. Verify `topic.lessons` array populated
3. Check for deleted lessons being counted

### Data not loading
1. Check browser console for Firebase errors
2. Verify user is logged in
3. Check Firestore has data at `/users/{userId}/children/`

### Import fails
1. Check YouTube URLs are valid
2. Check for duplicate topics (allowed)
3. Verify Firebase write permissions

---

## TO CONTINUE IF CONTEXT EXHAUSTED

1. **Run**: `npm run build` - verify no errors
2. **Run**: `npm run dev` - start local server
3. **Test**: Login → check data loads → verify lesson counts
4. **If broken**: Check browser console for errors
5. **Fix issues** based on error messages

---

*Last Updated: 2026-02-13*
