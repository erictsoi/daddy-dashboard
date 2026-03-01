import Y5Backup from '../data/SubjectCards/Y5-6 Subject Cards/backup_Y5-6_2026-02-28.json';
import Y7Backup from '../data/SubjectCards/Y7-9 Subject Cards/backup_Y7-9_2026-02-28.json';

export interface SubjectCard {
  id: string;
  yearGroup: string;
  subject: string;
  focus: string;
  playlists: {
    title: string;
    url: string;
    videos: {
      id: string;
      title: string;
      url: string;
    }[];
  }[];
}

export const SUBJECT_CARDS: Record<string, SubjectCard[]> = {
  'Y5-6': Y5Backup as SubjectCard[],
  'Y7-9': Y7Backup as SubjectCard[],
};

export const getSubjectCardsForYear = (yearGroup: string): SubjectCard[] => {
  return SUBJECT_CARDS[yearGroup] || [];
};

export const getSubjectCardsForChild = (yearGroup: string, childName: string): SubjectCard[] => {
  const cards = getSubjectCardsForYear(yearGroup);
  if (!cards.length) return [];
  
  return cards;
};
