# CurriculumBuilder vs YouTube Playlist Table - Comparison

## Column Mapping

| Current (8 cols) | New Table (7 cols) |
|------------------|-------------------|
| Who | Profile |
| Year | (derived from Profile) |
| Subject | Subject |
| Topic | (merged into Subject) |
| Lesson Title | (auto-generated from playlist) |
| Lesson Focus | YT Playlist Focus |
| Video URL | Primary YT Playlist (+ Backup 1, Backup 2) |
| Notes | Notes |

## Key Differences

1. **Multiple Playlists**: Current = 1 URL per row. New = 3 playlists per subject (Primary + 2 Backups)

2. **Topic Structure**: Current has separate Topic column. New uses Subject directly with Focus field

3. **Profile Mapping**: Current uses specific names ("Sophia"), New uses general profiles ("Y1/2 Child")

4. **Video Type**: Current parses single videos. New expects playlist URLs

## Integration Fields

```
Profile → childName + yearGroup
Subject → subjectCategory  
YT Playlist Focus → lessonFocus
Primary YT Playlist → videoUrl
Backup 1/Backup 2 → additional videoUrl options
Notes → lessonNotes
```

## Sample Data Mapping

| New Table Field | CurriculumBuilder Field |
|-----------------|------------------------|
| Y1/2 Child | childName: "Y1/2 Child", yearGroup: "Year 1/2" |
| English | subjectCategory: "English" |
| Phonics & stories | lessonFocus: "Phonics & stories" |
| BBC Alphablocks Phonics | videoUrl: "https://www.youtube.com/playlist?list=..." |
| Blending sounds... | lessonNotes: "Blending sounds, simple sentences" |
