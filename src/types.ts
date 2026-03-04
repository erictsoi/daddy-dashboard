export interface Lesson {
  id: string;
  title: string;
  durationMinutes?: number;
  completed: boolean;
  videoUrl?: string;
  outcomes?: string[];
  lessonFocus?: string;
  lessonNotes?: string;
  deleted?: boolean;
  timeSpentSeconds?: number;
  videoPosition?: number;
  orderIndex?: number;
}

export type TopicFrequency = 'low' | 'balanced' | 'high';

export interface Topic {
  id: string;
  name: string;
  lessons: Lesson[];
  youtubeUrls?: string[];  // Raw YouTube URLs (playlists/videos)
  focus?: string;          // "YT Playlist Focus" from table
  notes?: string;          // Notes from table
  timeSpentSeconds?: number;
  frequency?: TopicFrequency;
}

export type SubjectCategory = 'Maths' | 'English' | 'Science' | 'Humanities' | 'Creative' | (string & {});

export interface Subject {
  id: string;
  name: string; // Subject (e.g., "English", "Maths", "Science")
  topics: Topic[];
  category: SubjectCategory;
  color: string;
}

export interface YearGroup {
  id: string;
  name: string; // e.g., "Year 5", "Year 9"
  subjects: Subject[];
}

export interface ChildProfile {
  id: string;
  name: string;
  dob: string;
  avatar: string;
  themeColor: string;
  googleEmail?: string;
  yearGroups: YearGroup[];
  // Profile template fields (new)
  profileTemplate?: ProfileTemplate;
  profileData?: ProfileTemplateData;
}

// Profile Templates (6 UK Year Groups)
export type ProfileTemplate = 'Y1-2' | 'Y3-4' | 'Y5-6' | 'Y7-9' | 'Y10-11' | 'Y12-13';

// Stack Types (7 Subject Stacks)
export type StackType =
  | 'coreAcademics'
  | 'languages'
  | 'creativePerforming'
  | 'stemDigital'
  | 'physicalWellbeing'
  | 'characterEnrichment'
  | 'additionalSubjects';

// Curriculum Card (for template mode)
export interface CurriculumCard {
  id: string;
  focus: string;
  primaryPlaylist: string;
  backupPlaylist1?: string;
  backupPlaylist2?: string;
  notes?: string;
  outcomes?: string;
  approved: boolean;
}

// Stack (group of cards)
export interface CurriculumStack {
  type: StackType;
  cards: CurriculumCard[];
}

// Profile Template Data
export interface ProfileTemplateData {
  template: ProfileTemplate;
  customName?: string;
  interests?: string[];
  stacks: CurriculumStack[];
  approved: boolean;
  createdAt: string;
}

// View types were migrated to URL routing in App.tsx

export interface ScheduleBlock {
  id: string;
  type: 'academic' | 'creative' | 'break' | 'lunch';
  startTime: Date;
  endTime: Date;
  label?: string;
  children: {
    [childId: string]: {
      subjectId: string;
      topicId: string;
      subjectName: string;
      lessonId: string;
      lessonTitle: string;
      hasDevice: boolean;
    } | null;
  };
}

export interface ExpandedLesson {
  title: string; // Video title from YouTube
  videoUrl: string;
  videoId: string;
  position: number; // Position in playlist (1, 2, 3...)
}

export interface UserSettings {
  adminName: string;
  adminAvatar: string;
  adminColor: string;
  adminDob: string;
  parentEmail: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  adminName: '',
  adminAvatar: '👨‍🏫',
  adminColor: 'blue',
  adminDob: '',
  parentEmail: ''
};

export interface ParsedRow {
  childName: string;
  yearGroup: string;
  subjectCategory: SubjectCategory; // Subject (English, Maths, Science)
  subjectName: string; // Topic (Reading Comprehension, Algebra)
  lessonTitle: string;
  lessonFocus?: string;
  lessonNotes?: string;
  videoUrl: string;
  isValid: boolean;
  isYouTubeUrl: boolean;
  youTubeType?: 'video' | 'playlist';
  expandedLessons?: ExpandedLesson[];
  videoPosition?: number;
}

// Template Mode - 8 column import format
export interface ParsedTemplateRow {
  profile: string;
  subject: string;
  focus: string;
  primaryPlaylist: string;
  backupPlaylist1?: string;
  backupPlaylist2?: string;
  notes: string;
  outcomes?: string;
  isValid: boolean;
}

// --- Curriculum Library (Curated Playlists) ---

export interface CuratedPlaylist {
  id: string;
  yearGroup: ProfileTemplate;
  subject: string;
  topic: string;
  focus: string;
  primaryPlaylist: string;
  backupPlaylist1?: string;
  backupPlaylist2?: string;
  notes?: string;
  outcomes?: string;
  verified: boolean;
  addedBy: string;
  createdAt: string;
}

// Snake_case DB representation used by Firestore
export interface DbCuratedPlaylist {
  id: string;
  year_group: ProfileTemplate;
  subject: string;
  topic: string;
  focus: string;
  primary_playlist: string;
  backup_playlist_1?: string;
  backup_playlist_2?: string;
  notes?: string;
  outcomes?: string;
  verified: boolean;
  added_by: string;
  created_at: string;
}
