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