import { ChildProfile, ProfileTemplate, StackType, CurriculumStack } from './types';
import { getSubjectHexColor as getColor, getSubjectCategoryLabel as getCategoryLabel } from './utils/subjects';

export const getSubjectColor = (subjectName: string): string => {
  return getColor(subjectName);
};

export const getSubjectCategoryLabel = (subjectName: string): string => {
  return getCategoryLabel(subjectName);
};

export const INITIAL_DATA: ChildProfile[] = [];

// Suggested topics for curriculum building
export const SUGGESTED_TOPICS: Record<string, string[]> = {
  'English': ['Reading Comprehension', 'Writing Narratives', 'Grammar', 'Spelling', 'Creative Writing', 'Poetry'],
  'Maths': ['Number Operations', 'Algebra', 'Geometry', 'Fractions', 'Decimals', 'Percentages', 'Statistics'],
  'Science': ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Space', 'Experiments'],
  'History': ['Ancient Civilizations', 'World Wars', 'Local History', 'Historical Figures'],
  'Geography': ['Maps & Globes', 'Climate', 'Countries', 'Natural Resources'],
  'Languages': ['Vocabulary', 'Grammar', 'Conversation', 'Reading', 'Writing'],
};

// 7 Subject Stack Types
export const STACK_TYPES: StackType[] = [
  'coreAcademics',
  'languages',
  'creativePerforming',
  'stemDigital',
  'physicalWellbeing',
  'characterEnrichment',
  'additionalSubjects'
];

// Profile Templates (6 UK Year Groups)
export const PROFILE_TEMPLATES: { id: ProfileTemplate; label: string; ageRange: string; avatar: string }[] = [
  { id: 'Y1-2', label: 'Y1/2 Child', ageRange: '5-7 years', avatar: '🧒' },
  { id: 'Y3-4', label: 'Y3/4 Child', ageRange: '7-9 years', avatar: '👦' },
  { id: 'Y5-6', label: 'Y5/6 Child', ageRange: '9-11 years', avatar: '👧' },
  { id: 'Y7-9', label: 'Y7/8/9 Child', ageRange: '11-14 years', avatar: '🧑' },
  { id: 'Y10-11', label: 'Y10/11 Child', ageRange: '14-16 years', avatar: '👱' },
  { id: 'Y12-13', label: 'Y12/13 Child', ageRange: '16-18 years', avatar: '🎓' }
];

// Create empty stacks for a profile
export const createEmptyStacks = (): CurriculumStack[] => {
  return STACK_TYPES.map(type => ({ type, cards: [] }));
};
