import { ChildProfile, Lesson } from '../types';

export const countCompletedToday = (child: ChildProfile): number => {
    return child.yearGroups
        .flatMap(yg => yg.subjects)
        .flatMap(s => s.topics)
        .flatMap(t => t.lessons)
        .filter(l => l.completed && !l.deleted).length;
};

export const getAllLessons = (child: ChildProfile): Lesson[] => {
    return child.yearGroups
        .flatMap(yg => yg.subjects)
        .flatMap(s => s.topics)
        .flatMap(t => t.lessons)
        .filter(l => !l.deleted);
};

export const getCompletionRate = (child: ChildProfile): number => {
    const all = getAllLessons(child);
    const done = all.filter(l => l.completed).length;
    return all.length ? Math.round((done / all.length) * 100) : 0;
};

export const getTotalTimeHours = (child: ChildProfile): string => {
    const seconds = child.yearGroups
        .flatMap(yg => yg.subjects)
        .flatMap(s => s.topics)
        .flatMap(t => t.lessons)
        .reduce((sum, l) => sum + (l.timeSpentSeconds ?? 0), 0);
    return (seconds / 3600).toFixed(1);
};

export const calculateStreak = (child: ChildProfile): number => {
    // For now, return a placeholder until actual streak logic is fleshed out based on login dates
    return 5;
};
