# Implementation Plan: LocalStorage-First with Optional Supabase Sync

## Date: 2026-02-11

## Problem Statement
- Supabase sync causes duplicates and missing videos
- Users need reliable local backups via JSON files
- Supabase should only be used for sharing with testers (optional)

## Solution Overview
- Make localStorage the primary/reliable storage
- Remove all automatic Supabase syncing
- Use JSON files as the true backup mechanism
- Add manual "Sync to Supabase" button for optional cloud sharing

## Files to Modify
| File | Change |
|------|--------|
| `App.tsx` | Remove auto-sync logic, add manual sync buttons |

---

## Detailed Implementation Steps

### Step 1: Remove All Auto-Sync from Save Operations

#### Pattern to Replace
Every occurrence of:
```typescript
if (user) {
  saveFullCurriculum(newData, user.id).catch(console.error);
} else {
  saveLocalData(newData);
}
```

#### Replace With
```typescript
saveLocalData(newData);
```

#### Specific Locations in App.tsx

| Line | Function | Change |
|------|----------|--------|
| 219 | `handleAddChild` | Remove Supabase branch |
| 231 | `handleDeleteChild` | Remove Supabase branch |
| 245 | `handleUpdateChild` | Remove Supabase branch |
| 259 | `handleUpdateChildProfile` | Remove Supabase branch |
| 276 | `handleAddYearGroup` | Remove Supabase branch |
| 291 | `handleRemoveYearGroup` | Remove Supabase branch |
| 423 | `handleCompleteLesson` | Remove Supabase branch |
| 552-561 | `handleBulkImport` | Remove Supabase branch, keep localStorage |
| 592 | `handleDeleteSubject` | Remove Supabase branch |
| 639 | `handleAddLesson` | Remove Supabase branch |
| 677 | `handleRestoreLesson` | Remove Supabase branch |
| 727 | `handleHardDeleteLesson` | Remove Supabase branch |
| 767 | `handleSoftDeleteLesson` | Remove Supabase branch |
| 1051 | `handleToggleComplete` | Remove Supabase branch |
| 1150 | `handleSaveLesson` | Remove Supabase branch |
| 1191 | `handleSaveTopic` | Remove Supabase branch |

---

### Step 2: Add Manual Sync UI

Add to Data Management section (around line 916-985).

#### New Buttons to Add

```tsx
{/* Sync to Supabase (for sharing with testers) */}
<button
  onClick={async () => {
    if (!user) {
      showStatus('Please sign in first', 'error');
      return;
    }
    showStatus('Syncing to Supabase...', 'info');
    const result = await uploadToSupabase(user.id, data);
    showStatus(result.message, result.success ? 'success' : 'error');
  }}
  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 transition flex items-center gap-2"
>
  <UploadCloud size={16} />
  Sync to Supabase
</button>
```

---

### Step 3: Simplify Initial Load

#### Current Behavior (lines 127-204)
```typescript
useEffect(() => {
  if (authLoading) return;

  if (lastUserIdRef.current === user?.id && data.length > 0) return;
  if (isFetchingRef.current) return;
  if (isImportingRef.current) return;

  lastUserIdRef.current = user?.id || null;
  isFetchingRef.current = true;

  const loadData = async () => {
    setLoading(true);
    try {
      if (user) {
        // Check if user is a child by matching email
        try {
          const childData = await fetchChildByEmail(user.email || '');
          if (childData && childData.length > 0) {
            setChildProfile(childData[0]);
            setData(childData);
            return;
          }
        } catch (e) {
          console.log('Not a child account, checking for admin data');
        }

        // Fetch from Supabase
        const childrenData = await fetchChildren(user.id);
        if (childrenData.length > 0) {
          setData(childrenData);
        } else {
          setData([]);
        }
      } else {
        setData(getLocalData());
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setData(getLocalData());
    }
    setLoading(false);
    isFetchingRef.current = false;
  };
  loadData();
}, [user, authLoading]);
```

#### New Behavior
```typescript
useEffect(() => {
  if (authLoading) return;

  if (lastUserIdRef.current === user?.id && data.length > 0) return;
  if (isFetchingRef.current) return;
  if (isImportingRef.current) return;

  lastUserIdRef.current = user?.id || null;
  isFetchingRef.current = true;

  const loadData = async () => {
    setLoading(true);
    try {
      // Always load from localStorage first (reliable)
      const localData = getLocalData();
      setData(localData);

      // Optional: Try Supabase as secondary source
      if (user && user.email) {
        try {
          const childData = await fetchChildByEmail(user.email || '');
          if (childData && childData.length > 0) {
            setChildProfile(childData[0]);
            // Merge: Add Supabase children not in localStorage
            const localIds = new Set(localData.map(c => c.id));
            const newChildren = childData.filter(c => !localIds.has(c.id));
            if (newChildren.length > 0) {
              const merged = [...localData, ...newChildren];
              setData(merged);
              showStatus(`Loaded ${newChildren.length} children from Supabase`, 'success');
            }
          }
        } catch (e) {
          console.log('Supabase child lookup failed, using localStorage only');
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setData(getLocalData());
    }
    setLoading(false);
    isFetchingRef.current = false;
  };
  loadData();
}, [user, authLoading]);
```

---

### Step 4: Fix Current Supabase Duplicates

#### Instructions for Manual Fix (User to do via Dashboard)

1. Go to https://supabase.com → your project → Table Editor
2. Delete all rows from tables in this order:
   - `lessons` (has foreign keys)
   - `topics`
   - `subjects`
   - `year_groups`
   - `children`
3. In app: Click "Sync to Supabase" to upload fresh data

#### Optional: Add Clear Function (Future Enhancement)

```typescript
// In lib/dataService.ts - add this function
export const clearAllFromSupabase = async (userId: string): Promise<void> => {
  if (!supabase) return;

  // Delete lessons
  await supabase.from('lessons').delete().eq('user_id', userId);
  // Delete topics
  await supabase.from('topics').delete().eq('user_id', userId);
  // Delete subjects
  await supabase.from('subjects').delete().eq('user_id', userId);
  // Delete year_groups
  await supabase.from('year_groups').delete().eq('user_id', userId);
  // Delete children
  await supabase.from('children').delete().eq('user_id', userId);
}
```

---

## Files NOT Modified

| File | Reason |
|------|--------|
| `lib/dataService.ts` | Keep all functions for manual use |
| `components/CurriculumBuilder.tsx` | Already works with localStorage |
| `types.ts` | No structural changes |
| `constants.ts` | No changes |

---

## Updated Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  Normal Usage                                                    │
│                                                                 │
│  1. User works in app → data saves to localStorage (automatic)  │
│  2. User clicks "Export Curriculum" → downloads JSON backup      │
│  3. User can import JSON to restore or transfer data           │
│  4. Optional: Click "Sync to Supabase" to share with testers    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] **LocalStorage saves work** - Add/edit/delete lessons, refresh page, data persists
- [ ] **Export works** - Click Export, verify JSON file downloads with correct data
- [ ] **Import works** - Clear browser cache, Import JSON, verify data restored
- [ ] **Manual sync works** - Sign in, click Sync to Supabase, verify success message
- [ ] **No console errors** - Check browser dev tools
- [ ] **Child login still works** - Existing child profiles display correctly
- [ ] **Bulk import works** - Import curriculum via Curriculum Builder, verify data saves

---

## Rollback Plan

If issues arise, revert App.tsx from git:
```bash
git checkout HEAD -- App.tsx
```

Or manually restore the dual-storage pattern:
```typescript
if (user) {
  saveFullCurriculum(newData, user.id).catch(console.error);
} else {
  saveLocalData(newData);
}
```

---

## Estimated Time

- **Code changes**: 15-20 minutes
- **Testing**: 10-15 minutes
- **Total**: ~30-35 minutes

---

## Key Benefits

1. **Reliable**: localStorage is fast and always available
2. **User-controlled**: JSON exports are true backups
3. **Simple**: No more sync conflicts or duplicates
4. **Optional sharing**: Supabase only when you want it
5. **Easy to fix**: Import JSON → Export JSON workflow is foolproof

---

## Related Documentation

- See `AGENTS.md` for agent conventions
- See `types.ts` for data structures
- See `lib/dataService.ts` for storage functions
