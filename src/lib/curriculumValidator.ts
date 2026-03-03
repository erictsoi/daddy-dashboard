import { ProfileTemplate } from '../types';
import { UK_CURRICULUM, getCurriculumForYear, getSubjectsForYear, getTopicsForSubject } from '../data/ukCurriculum';

export interface CurriculumValidationResult {
  isValid: boolean;
  yearGroup: ProfileTemplate;
  subject: string;
  topic: string;
  focus: string;
  issues: string[];
  suggestions: string[];
  ukMatch?: {
    subject: string;
    topic: string;
    focus: string;
    exact: boolean;
  };
}

const TOPIC_ALIASES: Record<string, string[]> = {
  'Phonics': ['Phonics & Word Reading', 'Phonics', 'Letter Sounds', 'Synthetic Phonics'],
  'Reading': ['Word Reading', 'Comprehension', 'Reading Comprehension', 'Reading Skills'],
  'Writing': ['Composition', 'Creative Writing', 'Narrative Writing', 'Story Writing'],
  'Spelling': ['Spelling Rules', 'Spelling Common Words', 'Spelling Patterns'],
  'Number': ['Counting', 'Place Value', 'Number Bonds', 'Four Operations'],
  'Addition': ['Addition & Subtraction', 'Addition', 'Column Addition'],
  'Multiplication': ['Times Tables', 'Multiplication Tables', 'Times Tables 2,3,4,5,10'],
  'Fractions': ['Basic Fractions', 'Fraction Operations', 'Fractions Decimals Percentages'],
  'Shape': ['2D Shapes', '3D Shapes', 'Geometry', 'Angles & Lines'],
  'Plants': ['Plant Identification', 'Living Things', 'Plant Life Cycles'],
  'Animals': ['Animal Groups', 'Animal Classification', 'Living Things'],
  'Materials': ['Everyday Materials', 'States of Matter', 'Solids Liquids Gases'],
  'Light': ['Light & Shadows', 'Light', ' Optics'],
  'Forces': ['Forces & Motion', 'Forces', 'Gravity Friction Air Resistance'],
  'Electricity': ['Circuits', 'Electrical Circuits', 'Electricity'],
  'Rocks': ['Rock Types', 'Geology', 'Fossils'],
  'Weather': ['Weather & Seasons', 'Weather', 'Climate'],
  'Ancient Britain': ['Stone Age to Iron Age', 'Prehistoric Britain'],
  'Romans': ['Roman Britain', 'Roman Empire'],
  'UK Geography': ['UK Countries & Regions', 'British Isles'],
  'French': ['Basic French', 'French Conversation', 'French Language', 'French GCSE', 'A-Level French'],
  'Spanish': ['Spanish Language', 'Spanish GCSE', 'A-Level Spanish'],
  'German': ['Basic German', 'German Language', 'German GCSE', 'A-Level German'],
  'Geography': ['Rivers', 'Mountains', 'Climate', 'Weather', 'UK Geography', 'Europe', 'World Geography'],
  'History': ['Ancient Britain', 'Romans', 'Victorians', 'Ancient Egypt', 'Ancient Greece', 'Medieval', 'Tudors', 'World War'],
  'Algebra': ['Algebraic Expressions', 'Equations', 'Sequences', 'Basic Algebra'],
  'Statistics': ['Data Handling', 'Charts and Graphs', 'Statistics & Probability'],
  'Biology': ['GCSE Biology', 'A-Level Biology', 'Cell Structure', 'Organisation'],
  'Chemistry': ['GCSE Chemistry', 'A-Level Chemistry', 'Particle Theory'],
  'Physics': ['GCSE Physics', 'A-Level Physics', 'Forces and Motion', 'Energy Transfers'],
};

const INAPPROPRIATE_FOR_KS1 = [
  'Algebra', 'Chemistry', 'Physics', 'Geometry', 'Fractions', 'Decimals',
  'Percentages', 'Statistics', 'Evolution', 'Electricity', 'Earth & Space',
  'Ancient Egypt', 'Ancient Greece', 'Victorians', 'World War', 'Rivers',
  'Mountains', 'Trade', 'Medieval', 'Tudor', 'GCSE', 'A-Level', 'Ratio',
  'Probability', 'Metres', 'Kilometres', 'Roman Numerals', 'Negative Numbers',
];

const INAPPROPRIATE_FOR_KS2_LOWER = [
  'Algebra', 'Chemistry', 'Physics', 'Evolution', 'Electricity', 'Earth & Space',
  'Ancient Egypt', 'Ancient Greece', 'Victorians', 'GCSE', 'A-Level',
  'Statistics', 'Probability', 'Ratio', 'Negative Numbers',
];

const INAPPROPRIATE_FOR_KS2_UPPER = [
  'GCSE', 'A-Level', 'Negative Numbers', 'Algebra',
];

const getKeyStage = (yearGroup: ProfileTemplate): number => {
  const map: Record<ProfileTemplate, number> = {
    'Y1-2': 1,
    'Y3-4': 2,
    'Y5-6': 2,
    'Y7-9': 3,
    'Y10-11': 4,
    'Y12-13': 5,
  };
  return map[yearGroup] || 1;
};

const getInappropriateTopics = (yearGroup: ProfileTemplate): string[] => {
  const ks = getKeyStage(yearGroup);
  if (ks === 1) return INAPPROPRIATE_FOR_KS1;
  if (ks === 2) {
    if (yearGroup === 'Y3-4') return INAPPROPRIATE_FOR_KS2_LOWER;
    return INAPPROPRIATE_FOR_KS2_UPPER;
  }
  return [];
};

export const validateTopic = (
  yearGroup: ProfileTemplate,
  subject: string,
  topic: string,
  focus: string
): CurriculumValidationResult => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  const curriculum = getCurriculumForYear(yearGroup);
  if (!curriculum) {
    return {
      isValid: false,
      yearGroup,
      subject,
      topic,
      focus,
      issues: ['Unknown year group'],
      suggestions: [],
    };
  }

  const inappropriateTopics = getInappropriateTopics(yearGroup);
  const topicLower = topic.toLowerCase();
  const focusLower = focus.toLowerCase();
  
  for (const inappropriate of inappropriateTopics) {
    if (topicLower.includes(inappropriate.toLowerCase()) || 
        focusLower.includes(inappropriate.toLowerCase())) {
      issues.push(`"${inappropriate}" is not appropriate for ${yearGroup} (Key Stage ${getKeyStage(yearGroup)})`);
      suggestions.push(`Consider a simpler topic suitable for Key Stage ${getKeyStage(yearGroup)}`);
    }
  }

  const ukSubjects = getSubjectsForYear(yearGroup);
  const subjectMatch = ukSubjects.find(s => 
    s.toLowerCase() === subject.toLowerCase() ||
    s.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(s.toLowerCase())
  );

  if (!subjectMatch) {
    issues.push(`"${subject}" is not part of the UK National Curriculum for ${yearGroup}`);
    suggestions.push(`Valid subjects for ${yearGroup}: ${ukSubjects.slice(0, 5).join(', ')}${ukSubjects.length > 5 ? '...' : ''}`);
  }

  const ukTopics = getTopicsForSubject(yearGroup, subjectMatch || subject);
  let foundTopic = ukTopics.find(t => 
    t.topic.toLowerCase() === topicLower ||
    t.topic.toLowerCase().includes(topicLower) ||
    topicLower.includes(t.topic.toLowerCase())
  );

  if (!foundTopic) {
    for (const [alias, aliases] of Object.entries(TOPIC_ALIASES)) {
      if (aliases.some(a => topicLower.includes(a.toLowerCase()))) {
        foundTopic = ukTopics.find(t => 
          t.topic.toLowerCase().includes(alias.toLowerCase())
        );
        if (foundTopic) break;
      }
    }
  }

  let exactMatch = false;
  if (foundTopic) {
    exactMatch = foundTopic.focus.toLowerCase() === focusLower ||
                 foundTopic.topic.toLowerCase() === topicLower;
    
    if (!exactMatch) {
      issues.push(`"${focus}" doesn't exactly match UK curriculum.`);
      suggestions.push(`UK curriculum suggests: "${foundTopic.focus}"`);
    }
  } else if (ukTopics.length > 0) {
    suggestions.push(`Similar topics for ${subject} in ${yearGroup}: ${ukTopics.slice(0, 3).map(t => t.topic).join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    yearGroup,
    subject,
    topic,
    focus,
    issues,
    suggestions,
    ukMatch: foundTopic ? {
      subject: foundTopic.subject,
      topic: foundTopic.topic,
      focus: foundTopic.focus,
      exact: exactMatch,
    } : undefined,
  };
};

export const validatePlaylistBatch = (
  yearGroup: ProfileTemplate,
  playlists: { subject: string; topic: string; focus: string }[]
): CurriculumValidationResult[] => {
  return playlists.map(p => validateTopic(yearGroup, p.subject, p.topic, p.focus));
};

export const getCurriculumSuggestions = (
  yearGroup: ProfileTemplate,
  subject?: string
): { topic: string; focus: string }[] => {
  if (subject) {
    return getTopicsForSubject(yearGroup, subject).map(t => ({
      topic: t.topic,
      focus: t.focus,
    }));
  }
  
  const curriculum = getCurriculumForYear(yearGroup);
  if (!curriculum) return [];
  
  return curriculum.subjects.map(t => ({
    topic: t.topic,
    focus: t.focus,
  }));
};

export const isAgeAppropriate = (yearGroup: ProfileTemplate, topic: string): boolean => {
  const inappropriate = getInappropriateTopics(yearGroup);
  const topicLower = topic.toLowerCase();
  return !inappropriate.some(t => topicLower.includes(t.toLowerCase()));
};
