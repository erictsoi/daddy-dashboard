# Firebase Rework Notes

## Current State

### Frequency Weighting System (v3.8.1)

**UI Implemented:**
- Header buttons for balanced/stem/arts weighting per child
- Per-card star overrides (1-3 stars) for individual subject fine-tuning
- Stars saved to localStorage by subject NAME

**Schedule Generator:**
- Uses header mode (balanced/stem/arts) from localStorage
- Also reads per-subject overrides from localStorage
- Per-subject weights override header mode
- Topics added multiple times based on weight

### HOW IT WORKS

1. **Header Mode (balanced/stem/arts)** - Sets default weights for all subjects based on category
2. **Per-Subject Override** - Individual cards can be clicked to set custom weight (1-3 stars)
3. **Priority** - Per-subject weight takes priority over header mode
4. **Storage** - Both stored in localStorage by subject name (e.g., "Maths", "English")

### WIRING DIAGRAM

```
AdminDash.tsx
├── localStorage keys:
│   ├── 'freqModeSophia' → { "Maths": 3, "English": 2, ... }
│   ├── 'freqModeAdrian' → { "Maths": 3, "Science": 2, ... }
│   └── 'childFreqMode' → ["balanced", "balanced"]
│
└── State:
    ├── freqModeSophia: Record<string, 1|2|3>  ← stores by subject name
    ├── freqModeAdrian: Record<string, 1|2|3>
    └── childFreqMode: ['balanced'|'stem'|'arts', ...]

App.tsx (generateSchedule function)
├── Line 450: localStorage.getItem('childFreqMode')
├── Line 452: localStorage.getItem('freqModeSophia')
├── Line 453: localStorage.getItem('freqModeAdrian')
│
└── getSubjectWeight(subjectName, childIndex)
    ├── Line 459-461: Check per-subject override first
    │   └── Returns freqModeSophia[subjectName] or freqModeAdrian[subjectName]
    │
    └── Line 465-475: Fall back to child-level mode
        └── Returns 1, 2, or 3 based on balanced/stem/arts

Subject Matching
────────────────
AdminDash uses mock data with subject names: "Maths", "English", "Science", etc.
Real curriculum uses subject names from Firebase.

⚠️ NOTE: If curriculum has "Maths: Algebra" instead of "Maths", exact match fails.
   Consider fuzzy matching in future (e.g., subjectName.includes(key)).

