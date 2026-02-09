export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  videoUrl?: string; // YouTube ID or URL
  outcomes: string[];
  deleted?: boolean; // New flag for trash functionality
  timeSpentSeconds?: number; // Record actual time used
}

export interface Subject {
  id: string;
  name: string;
  category: 'Maths' | 'English' | 'Science' | 'Humanities' | 'Languages' | 'Creative' | 'Other';
  lessons: Lesson[];
  color: string;
  timeSpentSeconds?: number; // Persistent timer tracking total time spent on subject
}

export interface YearGroup {
  id: string;
  name: string; // e.g., "Year 9"
  subjects: Subject[];
}

export interface ChildProfile {
  id: string;
  name: string;
  dob: string;
  avatar: string;
  themeColor: string; // Tailwind color class prefix (e.g., 'blue', 'pink')
  yearGroups: YearGroup[];
}

export type ViewOrigin = 'HOME' | 'CHILD_DASHBOARD';

export type ViewState = 
  | { type: 'LANDING' }
  | { type: 'HOME' }
  | { type: 'CURRICULUM_BUILDER' }
  | { type: 'CHILD_DASHBOARD'; childId: string }
  | { type: 'SUBJECT_DETAIL'; childId: string; subjectId: string; origin: ViewOrigin }
  | { type: 'LESSON_PLAYER'; childId: string; subjectId: string; lessonId: string; origin: ViewOrigin };

export interface ScheduleBlock {
  id: string;
  type: 'academic' | 'creative' | 'break' | 'lunch';
  startTime: Date;
  endTime: Date;
  label?: string;
  adrian?: {
    subjectId: string;
    subjectName: string;
    lessonTitle: string;
    hasDevice: boolean;
    lessonId: string;
  } | null;
  sophia?: {
    subjectId: string;
    subjectName: string;
    lessonTitle: string;
    hasDevice: boolean;
    lessonId: string;
  } | null;
}

export interface ExpandedLesson {
  title: string;
  videoUrl: string;
  videoId: string;
  position: number;
}

export interface ParsedRow {
  childName: string;
  yearGroup: string;
  subjectCategory: string;
  subjectName: string;
  lessonTitle: string;
  notes: string;
  videoUrl: string;
  isValid: boolean;
  isYouTubeUrl: boolean;
  youTubeType?: 'video' | 'playlist';
  expandedLessons?: ExpandedLesson[];
}

// Supabase Database Types

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

export interface DbLesson {
  id: string;
  subject_id: string;
  title: string;
  video_url: string | null;
  duration_minutes: number;
  outcomes: string[];
  completed: boolean;
  time_spent_seconds: number;
  deleted: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Joined types for easier querying

export interface ChildWithRelations extends DbChild {
  year_groups: YearGroupWithRelations[];
}

export interface YearGroupWithRelations extends DbYearGroup {
  subjects: SubjectWithLessons[];
}

export interface SubjectWithLessons extends DbSubject {
  lessons: DbLesson[];
}