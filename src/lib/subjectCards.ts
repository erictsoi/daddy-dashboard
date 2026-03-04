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

// Module-level cache — loaded once per year group, reused forever
const cardsCache: Record<string, SubjectCard[]> = {};

// Async loader — dynamically imports JSON only when first needed (~1MB each)
export const loadSubjectCardsForYear = async (yearGroup: string): Promise<SubjectCard[]> => {
  if (cardsCache[yearGroup]) return cardsCache[yearGroup];

  try {
    let mod: any;
    if (yearGroup === 'Y1-2') {
      mod = await import('../data/SubjectCards/Y1-2 Subject Cards/backup_Y1-2_2026-03-05.json');
    } else if (yearGroup === 'Y3-4') {
      mod = await import('../data/SubjectCards/Y3-4 Subject Cards/backup_Y3-4_2026-03-05.json');
    } else if (yearGroup === 'Y5-6') {
      mod = await import('../data/SubjectCards/Y5-6 Subject Cards/backup_Y5-6_2026-02-28.json');
    } else if (yearGroup === 'Y7-9') {
      mod = await import('../data/SubjectCards/Y7-9 Subject Cards/backup_Y7-9_2026-02-28.json');
    } else if (yearGroup === 'Y10-11') {
      mod = await import('../data/SubjectCards/Y10-11 Subject Cards/backup_Y10-11_2026-03-05.json');
    } else if (yearGroup === 'Y12-13') {
      mod = await import('../data/SubjectCards/Y12-13 Subject Cards/backup_Y12-13_2026-03-05.json');
    } else {
      return [];
    }
    cardsCache[yearGroup] = mod.default as SubjectCard[];
    return cardsCache[yearGroup];
  } catch (error) {
    console.error(`Error loading subject cards for ${yearGroup}:`, error);
    return [];
  }
};

// Synchronous getter — returns cached data or empty array.
// Callers should await loadSubjectCardsForYear() first to populate the cache.
export const getSubjectCardsForYear = (yearGroup: string): SubjectCard[] => {
  return cardsCache[yearGroup] || [];
};

export const getSubjectCardsForChild = (yearGroup: string, _childName: string): SubjectCard[] => {
  return getSubjectCardsForYear(yearGroup);
};
