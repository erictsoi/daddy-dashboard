import { ChildProfile, Lesson } from '../types';

// ─── Flat lesson helpers ──────────────────────────────────────────────────────

export const getAllLessons = (child: ChildProfile): Lesson[] => {
  // Handle demo profiles or children without yearGroups
  if (!child.yearGroups || child.yearGroups.length === 0) {
    return [];
  }
  
  return child.yearGroups
    .flatMap(yg => yg.subjects || [])
    .flatMap(s => s.topics || [])
    .flatMap(t => t.lessons || []);
};

export const getActiveLessons = (child: ChildProfile): Lesson[] =>
  getAllLessons(child).filter(l => !l.deleted);

export const getCompletedLessons = (child: ChildProfile): Lesson[] =>
  getActiveLessons(child).filter(l => l.completed);

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Completion rate as a 0–100 integer.
 */
export const getCompletionRate = (child: ChildProfile): number => {
  const active = getActiveLessons(child);
  if (active.length === 0) return 0;
  return Math.round((active.filter(l => l.completed).length / active.length) * 100);
};

/**
 * Total time spent across all lessons, returned as a display string e.g. "6.2h".
 */
export const getTotalTimeDisplay = (child: ChildProfile): string => {
  const totalSeconds = getAllLessons(child).reduce(
    (sum, l) => sum + (l.timeSpentSeconds ?? 0),
    0
  );
  return (totalSeconds / 3600).toFixed(1) + 'h';
};

/**
 * Total time in seconds.
 */
export const getTotalTimeSeconds = (child: ChildProfile): number =>
  getAllLessons(child).reduce((sum, l) => sum + (l.timeSpentSeconds ?? 0), 0);

/**
 * Number of lessons completed today (using timeSpentSeconds as a proxy —
 * replace with a `completedAt` timestamp field if you add one).
 * For now returns total completed count as a reasonable fallback.
 */
export const getCompletedTodayCount = (child: ChildProfile): number =>
  getCompletedLessons(child).length;

/**
 * Total active lesson count.
 */
export const getTotalLessonCount = (child: ChildProfile): number =>
  getActiveLessons(child).length;

/**
 * Per-subject completion stats — used for the subject breakdown bar chart.
 */
export interface SubjectStat {
  name: string;
  completed: number;
  total: number;
  percent: number;
  color: string;
}

export const getSubjectStats = (child: ChildProfile): SubjectStat[] => {
  // Handle demo profiles or children without yearGroups
  if (!child.yearGroups || child.yearGroups.length === 0) {
    return [];
  }
  
  return child.yearGroups
    .flatMap(yg => yg.subjects || [])
    .map(sub => {
      const lessons = (sub.topics || []).flatMap(t => t.lessons || []).filter(l => !l.deleted);
      const completed = lessons.filter(l => l.completed).length;
      const total = lessons.length;
      return {
        name: sub.name,
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        color: sub.color,
      };
    })
    .filter(s => s.total > 0)
    .sort((a, b) => b.percent - a.percent);
};

/**
 * Builds a subject card list for the AdminDash subject grid.
 */
export interface SubjectCard {
  subjectId: string;
  subject: string;
  topic: string;
  icon: string;
  color: string;
  progress: number;
  total: number;
  category: string;
}

const SUBJECT_ICONS: Record<string, string> = {
  Maths: '📐',
  English: '📖',
  Science: '🔬',
  Art: '🎨',
  Music: '🎵',
  PE: '⚽',
  History: '📜',
  Geography: '🌍',
  Drama: '🎭',
  Technology: '✏️',
  Languages: '🗣️',
  PSHE: '💛',
  Physics: '⚡',
  Design: '✏️',
  'Computer Science': '💻',
  Default: '📚',
};

export const buildSubjectCards = (child: ChildProfile): SubjectCard[] => {
  // Handle demo profiles or children without yearGroups
  if (!child.yearGroups || child.yearGroups.length === 0) {
    return [];
  }
  
  return child.yearGroups.flatMap(yg =>
    (yg.subjects || []).map(sub => {
      const lessons = (sub.topics || []).flatMap(t => t.lessons || []).filter(l => !l.deleted);
      const completed = lessons.filter(l => l.completed).length;
      const firstTopic = (sub.topics || [])[0]?.name ?? '';
      return {
        subjectId: sub.id,
        subject: sub.name,
        topic: firstTopic,
        icon: SUBJECT_ICONS[sub.name] ?? SUBJECT_ICONS.Default,
        color: sub.color,
        progress: completed,
        total: lessons.length,
        category: sub.category,
      };
    })
  );
};

/**
 * Naive streak: counts how many consecutive days (working backwards from today)
 * have at least one completed lesson. Requires a `completedAt` field to be
 * accurate — currently uses total completed count as a placeholder.
 *
 * TODO: add `completedAt: string` (ISO date) to the Lesson type and use that.
 */
export const getStreak = (_child: ChildProfile): number => {
  return 0;
};

/**
 * Returns today's date formatted for display.
 */
export const getTodayDisplay = (): string =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// ─── Backward compatibility aliases ────────────────────────────────────────────

/** @deprecated Use getCompletedTodayCount */
export const countCompletedToday = getCompletedTodayCount;

/** @deprecated Use getTotalTimeDisplay */
export const getTotalTimeHours = (child: ChildProfile): string => getTotalTimeDisplay(child);

/** @deprecated Use getStreak */
export const calculateStreak = getStreak;
