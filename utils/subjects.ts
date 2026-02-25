export type SubjectCategory = 'core' | 'languages' | 'creative' | 'stem' | 'physical';

export interface SubjectColor {
  category: SubjectCategory;
  color: string;
  icon: string;
}

const SUBJECT_COLORS: Record<string, SubjectColor> = {
  // Core Learning - Reds/Maroons
  'Maths': { category: 'core', color: '#DC2626', icon: '📐' },
  'Math': { category: 'core', color: '#DC2626', icon: '📐' },
  'English': { category: 'core', color: '#B91C1C', icon: '📖' },
  'Reading': { category: 'core', color: '#B91C1C', icon: '📖' },
  'Writing': { category: 'core', color: '#991B1B', icon: '✍️' },
  'Science': { category: 'core', color: '#BE123C', icon: '🔬' },
  'Humanities': { category: 'core', color: '#9F1239', icon: '📜' },
  'History': { category: 'core', color: '#881337', icon: '📜' },
  'Geography': { category: 'core', color: '#751515', icon: '🌍' },
  'Social Studies': { category: 'core', color: '#751515', icon: '🌍' },
  
  // Languages - Yellows/Golds
  'Languages': { category: 'languages', color: '#F59E0B', icon: '🗣️' },
  'Modern Language': { category: 'languages', color: '#F59E0B', icon: '🗣️' },
  'French': { category: 'languages', color: '#D97706', icon: '🗣️' },
  'Spanish': { category: 'languages', color: '#B45309', icon: '🗣️' },
  'Chinese': { category: 'languages', color: '#F59E0B', icon: '🗣️' },
  'German': { category: 'languages', color: '#D97706', icon: '🗣️' },
  'Latin': { category: 'languages', color: '#B45309', icon: '🗣️' },
  'Home Language': { category: 'languages', color: '#FBBF24', icon: '🏠' },
  'EAL': { category: 'languages', color: '#F59E0B', icon: '🗣️' },
  
  // Creative - Purples/Violets
  'Art': { category: 'creative', color: '#7C3AED', icon: '🎨' },
  'Art & Design': { category: 'creative', color: '#7C3AED', icon: '🎨' },
  'Design': { category: 'creative', color: '#6D28D9', icon: '✏️' },
  'Music': { category: 'creative', color: '#8B5CF6', icon: '🎵' },
  'Drama': { category: 'creative', color: '#A78BFA', icon: '🎭' },
  'Performing Arts': { category: 'creative', color: '#A78BFA', icon: '🎭' },
  'Dance': { category: 'creative', color: '#7C3AED', icon: '💃' },
  'Photography': { category: 'creative', color: '#8B5CF6', icon: '📷' },
  'Media': { category: 'creative', color: '#6D28D9', icon: '🎬' },
  'Film': { category: 'creative', color: '#6D28D9', icon: '🎬' },
  
  // STEM & Digital - Blues/Cyans
  'Computing': { category: 'stem', color: '#2563EB', icon: '💻' },
  'Coding': { category: 'stem', color: '#3B82F6', icon: '💻' },
  'Computer Science': { category: 'stem', color: '#1D4ED8', icon: '💻' },
  'ICT': { category: 'stem', color: '#2563EB', icon: '💻' },
  'Robotics': { category: 'stem', color: '#0EA5E9', icon: '🤖' },
  'Design & Technology': { category: 'stem', color: '#06B6D4', icon: '⚙️' },
  'Design and Technology': { category: 'stem', color: '#06B6D4', icon: '⚙️' },
  'Technology': { category: 'stem', color: '#0891B2', icon: '⚙️' },
  'Engineering': { category: 'stem', color: '#0EA5E9', icon: '🔧' },
  'Economics': { category: 'stem', color: '#2563EB', icon: '📊' },
  'Business': { category: 'stem', color: '#3B82F6', icon: '💼' },
  
  // Physical & Life - Greens
  'PE': { category: 'physical', color: '#16A34A', icon: '⚽' },
  'PE / Sport': { category: 'physical', color: '#16A34A', icon: '⚽' },
  'Sport': { category: 'physical', color: '#16A34A', icon: '⚽' },
  'Sports': { category: 'physical', color: '#16A34A', icon: '⚽' },
  'Health': { category: 'physical', color: '#22C55E', icon: '❤️' },
  'Wellbeing': { category: 'physical', color: '#22C55E', icon: '💛' },
  'PSHE': { category: 'physical', color: '#4ADE80', icon: '💛' },
  'PSHE / Wellbeing': { category: 'physical', color: '#4ADE80', icon: '💛' },
  'Life Skills': { category: 'physical', color: '#22C55E', icon: '🌱' },
  'Religion': { category: 'physical', color: '#16A34A', icon: '✝️' },
  'Religious Education': { category: 'physical', color: '#16A34A', icon: '✝️' },
  'RE': { category: 'physical', color: '#16A34A', icon: '✝️' },
  'Citizenship': { category: 'physical', color: '#22C55E', icon: '🏛️' },
  'Personal': { category: 'physical', color: '#4ADE80', icon: '👤' },
  'Social': { category: 'physical', color: '#22C55E', icon: '👥' },
  
  // Default fallback
  'default': { category: 'core', color: '#6B7280', icon: '📚' },
};

const CATEGORY_COLORS: Record<SubjectCategory, { bg: string; border: string; text: string }> = {
  core: { bg: '#FEF2F2', border: '#DC2626', text: '#DC2626' },
  languages: { bg: '#FFFBEB', border: '#F59E0B', text: '#F59E0B' },
  creative: { bg: '#F5F3FF', border: '#7C3AED', text: '#7C3AED' },
  stem: { bg: '#EFF6FF', border: '#2563EB', text: '#2563EB' },
  physical: { bg: '#F0FDF4', border: '#16A34A', text: '#16A34A' },
};

export function getSubjectColor(subjectName: string): SubjectColor {
  const normalized = subjectName.trim();
  
  // Direct match
  if (SUBJECT_COLORS[normalized]) {
    return SUBJECT_COLORS[normalized];
  }
  
  // Fuzzy match - check if any key is contained in the subject name
  for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
    if (key === 'default') continue;
    if (normalized.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalized.toLowerCase())) {
      return value;
    }
  }
  
  return SUBJECT_COLORS.default;
}

export function getCategoryColors(category: SubjectCategory) {
  return CATEGORY_COLORS[category];
}

export function getSubjectCategory(subjectName: string): SubjectCategory {
  return getSubjectColor(subjectName).category;
}

// Helper to get just the color string (for backward compatibility)
export function getSubjectHexColor(subjectName: string): string {
  return getSubjectColor(subjectName).color;
}

// Helper to get just the icon
export function getSubjectIcon(subjectName: string): string {
  return getSubjectColor(subjectName).icon;
}
