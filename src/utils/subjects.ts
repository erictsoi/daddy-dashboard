export type SubjectCategory = 'core' | 'science' | 'languages' | 'creative' | 'stem' | 'physical' | 'additional';
import { ProfileTemplate } from '../types';
import { UK_CURRICULUM } from '../data/ukCurriculum';

export const normalizeYearGroup = (year: string): ProfileTemplate => {
  const yearMatch = year.match(/Year\s*(\d+)/i);
  if (yearMatch) {
    const yearNum = parseInt(yearMatch[1]);
    if (yearNum <= 2) return 'Y1-2';
    if (yearNum <= 4) return 'Y3-4';
    if (yearNum <= 6) return 'Y5-6';
    if (yearNum <= 9) return 'Y7-9';
    if (yearNum <= 11) return 'Y10-11';
    return 'Y12-13';
  }
  const direct = UK_CURRICULUM.find(c => c.yearGroup.toLowerCase() === year.toLowerCase());
  if (direct) return direct.yearGroup;
  return 'Y5-6';
};

export interface SubjectColor {
  category: SubjectCategory;
  categoryLabel: string;
  color: string;
  icon: string;
}

const SUBJECT_COLORS: Record<string, SubjectColor> = {
  // Core Learning - Red
  'English': { category: 'core', categoryLabel: 'Core Learning', color: '#FF4444', icon: '📖' },
  'Reading': { category: 'core', categoryLabel: 'Core Learning', color: '#FF4444', icon: '📖' },
  'Writing': { category: 'core', categoryLabel: 'Core Learning', color: '#EE3333', icon: '✍️' },
  'Literacy': { category: 'core', categoryLabel: 'Core Learning', color: '#FF4444', icon: '📖' },
  'Maths': { category: 'core', categoryLabel: 'Core Learning', color: '#FF6666', icon: '📐' },
  'Math': { category: 'core', categoryLabel: 'Core Learning', color: '#FF6666', icon: '📐' },
  'Mathematics': { category: 'core', categoryLabel: 'Core Learning', color: '#FF6666', icon: '📐' },
  
  // Science - Blue
  'Science': { category: 'science', categoryLabel: 'Science', color: '#00A8DD', icon: '🔬' },
  'Biology': { category: 'science', categoryLabel: 'Science', color: '#0099CC', icon: '🧬' },
  'Chemistry': { category: 'science', categoryLabel: 'Science', color: '#00A8DD', icon: '⚗️' },
  'Physics': { category: 'science', categoryLabel: 'Science', color: '#0088BB', icon: '⚛️' },
  
  // Humanities - Red/Orange variants
  'Humanities': { category: 'core', categoryLabel: 'Core Learning', color: '#FF4444', icon: '📜' },
  'History': { category: 'core', categoryLabel: 'Core Learning', color: '#FF5544', icon: '📜' },
  'Geography': { category: 'core', categoryLabel: 'Core Learning', color: '#FF6644', icon: '🌍' },
  'Social Studies': { category: 'core', categoryLabel: 'Core Learning', color: '#FF6644', icon: '🌍' },
  
  // Languages - Orange
  'Languages': { category: 'languages', categoryLabel: 'Languages', color: '#FF9933', icon: '🗣️' },
  'Modern Language': { category: 'languages', categoryLabel: 'Languages', color: '#FF9933', icon: '🗣️' },
  'French': { category: 'languages', categoryLabel: 'Languages', color: '#FF8822', icon: '🗣️' },
  'Spanish': { category: 'languages', categoryLabel: 'Languages', color: '#FF7711', icon: '🗣️' },
  'Chinese': { category: 'languages', categoryLabel: 'Languages', color: '#FF9933', icon: '🗣️' },
  'German': { category: 'languages', categoryLabel: 'Languages', color: '#FF8822', icon: '🗣️' },
  'Latin': { category: 'languages', categoryLabel: 'Languages', color: '#FF7711', icon: '🗣️' },
  'Home Language': { category: 'languages', categoryLabel: 'Languages', color: '#FFAA44', icon: '🏠' },
  'EAL': { category: 'languages', categoryLabel: 'Languages', color: '#FF9933', icon: '🗣️' },
  
  // Creative - Purple
  'Art': { category: 'creative', categoryLabel: 'Creative', color: '#7744DD', icon: '🎨' },
  'Art & Design': { category: 'creative', categoryLabel: 'Creative', color: '#7744DD', icon: '🎨' },
  'Design': { category: 'creative', categoryLabel: 'Creative', color: '#6633CC', icon: '✏️' },
  'Music': { category: 'creative', categoryLabel: 'Creative', color: '#8855EE', icon: '🎵' },
  'Drama': { category: 'creative', categoryLabel: 'Creative', color: '#9966FF', icon: '🎭' },
  'Performing Arts': { category: 'creative', categoryLabel: 'Creative', color: '#9966FF', icon: '🎭' },
  'Dance': { category: 'creative', categoryLabel: 'Creative', color: '#7744DD', icon: '💃' },
  'Photography': { category: 'creative', categoryLabel: 'Creative', color: '#8855EE', icon: '📷' },
  'Media': { category: 'creative', categoryLabel: 'Creative', color: '#6633CC', icon: '🎬' },
  'Film': { category: 'creative', categoryLabel: 'Creative', color: '#6633CC', icon: '🎬' },
  
  // STEM & Digital - Blue
  'Computing': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#3355DD', icon: '💻' },
  'Coding': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#4477EE', icon: '💻' },
  'Computer Science': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#2244CC', icon: '💻' },
  'ICT': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#3355DD', icon: '💻' },
  'Robotics': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#2288DD', icon: '🤖' },
  'Design & Technology': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#2299BB', icon: '⚙️' },
  'Design and Technology': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#2299BB', icon: '⚙️' },
  'Technology': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#2299BB', icon: '⚙️' },
  'Engineering': { category: 'stem', categoryLabel: 'STEM & Digital', color: '#2288DD', icon: '🔧' },
  
  // Physical & Life - Green
  'PE': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '⚽' },
  'PE / Sport': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '⚽' },
  'Sport': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '⚽' },
  'Sports': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '⚽' },
  'Health': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '❤️' },
  'Wellbeing': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '💛' },
  'PSHE': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '💛' },
  'PSHE / Wellbeing': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '💛' },
  'Life Skills': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '🌱' },
  'Religion': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '✝️' },
  'Religious Education': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '✝️' },
  'RE': { category: 'physical', categoryLabel: 'Physical & Life', color: '#44AA22', icon: '✝️' },
  'Citizenship': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '🏛️' },
  'Personal': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '👤' },
  'Social': { category: 'physical', categoryLabel: 'Physical & Life', color: '#55BB33', icon: '👥' },
  
  // Additional - Yellow
  'Economics': { category: 'additional', categoryLabel: 'Additional', color: '#DDDD22', icon: '📊' },
  'Business': { category: 'additional', categoryLabel: 'Additional', color: '#CCCC11', icon: '💼' },
  'Media Studies': { category: 'additional', categoryLabel: 'Additional', color: '#DDDD22', icon: '🎬' },
  'Exam Prep': { category: 'additional', categoryLabel: 'Additional', color: '#EEEE44', icon: '📝' },
  'Debate': { category: 'additional', categoryLabel: 'Additional', color: '#DDDD22', icon: '🎤' },
  'Public Speaking': { category: 'additional', categoryLabel: 'Additional', color: '#EEEE44', icon: '🎤' },
  
  // Default fallback
  'default': { category: 'additional', categoryLabel: 'Additional', color: '#6B7280', icon: '📚' },
};

const CATEGORY_COLORS: Record<SubjectCategory, { bg: string; border: string; text: string; label: string }> = {
  core: { bg: '#FFE5E5', border: '#FF4444', text: '#DD2222', label: 'Core Learning' },
  science: { bg: '#E0F7FF', border: '#00A8DD', text: '#0088BB', label: 'Science' },
  languages: { bg: '#FFF3E0', border: '#FF9933', text: '#DD7722', label: 'Languages' },
  creative: { bg: '#EDE5FF', border: '#7744DD', text: '#5522AA', label: 'Creative' },
  stem: { bg: '#E0E8FF', border: '#3355DD', text: '#2244BB', label: 'STEM & Digital' },
  physical: { bg: '#E5FFE0', border: '#44AA22', text: '#338819', label: 'Physical & Life' },
  additional: { bg: '#FFFDE0', border: '#DDDD22', text: '#AAAA11', label: 'Additional' },
};

export function getSubjectColor(subjectName: string): SubjectColor {
  const normalized = subjectName.trim();
  
  if (SUBJECT_COLORS[normalized]) {
    return SUBJECT_COLORS[normalized];
  }
  
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

export function getSubjectCategoryLabel(subjectName: string): string {
  return getSubjectColor(subjectName).categoryLabel;
}

export function getSubjectHexColor(subjectName: string): string {
  return getSubjectColor(subjectName).color;
}

export function getSubjectIcon(subjectName: string): string {
  return getSubjectColor(subjectName).icon;
}

// Subject bucket ordering for display
export const SUBJECT_BUCKET_ORDER: SubjectCategory[] = [
  'core',
  'science', 
  'languages',
  'creative',
  'stem',
  'physical',
  'additional',
];

export const DEFAULT_SUBJECTS = [
  // Core Learning
  'English',
  'Maths',
  // Science
  'Science',
  // Humanities (in Core)
  'History',
  'Geography',
  // Languages
  'Modern Language',
  // Creative
  'Art & Design',
  'Music',
  'Drama',
  // STEM & Digital
  'Computing / ICT',
  'Design & Technology',
  // Physical & Life
  'PE / Sport',
  'PSHE / Wellbeing',
  'Religion',
];

export const EXTRA_SUBJECTS = [
  { name: 'Extra Languages', options: ['Chinese', 'German', 'Latin', 'Japanese', 'Korean'] },
  { name: 'Economics / Business', options: ['Economics', 'Business', 'Accounting'] },
  { name: 'Media / Film / Photography', options: ['Media Studies', 'Film Studies', 'Photography'] },
  { name: 'Coding / Robotics', options: ['Coding', 'Robotics', 'Python', 'JavaScript'] },
  { name: 'Dance', options: ['Dance', 'Contemporary Dance', 'Ballet'] },
  { name: 'Debate / Public Speaking', options: ['Debate', 'Model UN', 'Public Speaking'] },
  { name: 'Exam Prep', options: ['11+ Prep', 'GCSE Booster', 'A-Level Prep'] },
  { name: 'Custom Subject', options: [] },
];
