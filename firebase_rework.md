# Firebase Rework Notes

## Current State

### Frequency Weighting System (v3.8.0)

**UI Implemented:**
- Header buttons for balanced/stem/arts weighting per child
- Per-card star overrides (1-3 stars) for individual subject fine-tuning
- Stars saved to localStorage

**Schedule Generator:**
- Uses header mode (balanced/stem/arts) from localStorage
- Applies weighting when building topic pool
- Topics added multiple times based on weight

### NOT YET CONNECTED

The per-card star overrides (individual subject weighting) are NOT connected to the schedule generator because:

1. **AdminDash uses mock data** - The subject cards in AdminDash display dummy data (SUBJECTS constant), not the actual curriculum from Firebase
2. **Per-card weights stored per-index** - The star overrides are stored as `{ 0: 3, 1: 2, ... }` where keys are array indices, not subject IDs
3. **Schedule uses real data** - The schedule generator pulls from Firebase/real curriculum data which has different subject IDs

### To Fully Connect

To connect per-card overrides to schedule generation, would need to:

1. Store frequency weights by actual subject ID (not array index)
2. In schedule generator, read per-subject frequency from localStorage or Firebase
3. Apply subject-level frequency in addition to topic-level frequency

### Subject Categories (for reference)

**STEM Subjects:**
- Maths
- Science
- Physics
- Technology
- Computer Science
- Design

**Core Subjects:**
- Maths
- English
- Science

**Arts/Humanities:**
- English
- Art
- Music
- Drama
- History
- Geography
- Languages
- PE
- PSHE
