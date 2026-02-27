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

// Database Types

export interface DbProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface DbChild {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  theme_color: string;
  dob: string | null;
  google_email: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DbYearGroup {
  id: string;
  child_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface DbSubject {
  id: string;
  year_group_id: string;
  name: string;
  category: string;
  color: string;
  order_index: number;
  created_at: string;
}

export interface DbTopic {
  id: string;
  subject_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface DbLesson {
  id: string;
  topic_id: string;
  title: string;
  video_url: string | null;
  duration_minutes: number;
  outcomes: string[];
  completed: boolean;
  time_spent_seconds: number;
  deleted: boolean;
  order_index: number;
  lesson_focus?: string | null;
  lesson_notes?: string | null;
  video_position?: number | null;
  created_at: string;
  updated_at: string;
}

// Joined types for easier querying

export interface ChildWithRelations extends DbChild {
  year_groups: YearGroupWithRelations[];
}

export interface YearGroupWithRelations extends DbYearGroup {
  subjects: SubjectWithTopics[];
}

export interface SubjectWithTopics extends DbSubject {
  topics: TopicWithLessons[];
}

export interface TopicWithLessons extends DbTopic {
  lessons: DbLesson[];
}
