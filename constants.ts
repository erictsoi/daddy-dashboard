import { ChildProfile } from './types';

// Empty initial state - user must add their own kids
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
