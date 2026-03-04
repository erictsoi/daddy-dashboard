import { ProfileTemplate } from '../types';

export interface UKCurriculumTopic {
  subject: string;
  topic: string;
  focus: string;
  description: string;
}

export interface UKCurriculumYear {
  yearGroup: ProfileTemplate;
  keyStage: number;
  ageRange: string;
  statutory: number;
  subjects: UKCurriculumTopic[];
}

export const UK_CURRICULUM: UKCurriculumYear[] = [
  {
    yearGroup: 'Y1-2',
    keyStage: 1,
    ageRange: '5-6 years',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'Phonics & stories', focus: 'Phonics', description: 'Word reading, phonemic awareness, simple stories' },
      { subject: 'Maths', topic: 'Number bonds/counting', focus: 'Arithmetic', description: 'Counting to 100, addition/subtraction, number bonds' },
      { subject: 'Science', topic: 'Plants/animals', focus: 'Biology', description: 'Identifying plants, animals, life cycles' },
      { subject: 'Science', topic: 'Materials', focus: 'Chemistry', description: 'Everyday materials and their properties' },
      { subject: 'History', topic: 'Famous people', focus: 'Historical figures', description: 'Kings, queens, inventors, explorers' },
      { subject: 'Geography', topic: 'Local area/weather', focus: 'Location', description: 'UK maps, seasonal weather patterns' },
      { subject: 'Computing', topic: 'Algorithms', focus: 'Coding', description: 'Sequencing, simple directions, logic' },
      { subject: 'Art & Design', topic: 'Painting/collage', focus: 'Creative', description: 'Primary colors, textures, simple drawings' },
      { subject: 'Music', topic: 'Rhythm/singing', focus: 'Performance', description: 'Action songs, clapping, copy rhythms' },
      { subject: 'PE', topic: 'Movement/games', focus: 'Physical', description: 'Balance, coordination, fundamental games' },
    ]
  },

  {
    yearGroup: 'Y3-4',
    keyStage: 2,
    ageRange: '7-8 years',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'Stories & poems', focus: 'Reading', description: 'Fairy tales, poetry, inference skills' },
      { subject: 'Maths', topic: 'Fractions basics', focus: 'Arithmetic', description: 'Equivalence, decimals intro, fractions' },
      { subject: 'Science', topic: 'Living things', focus: 'Biology', description: 'Food chains, habitats, classification' },
      { subject: 'Science', topic: 'Forces/magnets', focus: 'Physics', description: 'Magnets, friction, simple machines' },
      { subject: 'History', topic: 'Romans/Vikings', focus: 'British History', description: 'Invasions, settlements, timelines' },
      { subject: 'Geography', topic: 'UK regions', focus: 'Human Geography', description: 'Counties, rivers, map reading' },
      { subject: 'Computing', topic: 'Algorithms', focus: 'Programming', description: 'Scratch basics, debugging, loops' },
      { subject: 'Modern Language', topic: 'Basic vocab', focus: 'MFL', description: 'Greetings, numbers, simple phrases (French/Spanish)' },
      { subject: 'Music', topic: 'Rhythm/singing', focus: 'Ensemble', description: 'Recorders, improvisation, rhythmic notation' },
    ]
  },

  {
    yearGroup: 'Y5-6',
    keyStage: 2,
    ageRange: '9-10 years',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'Plays & poetry', focus: 'Literacy', description: 'Shakespeare, performance poetry, analysis' },
      { subject: 'Maths', topic: 'Decimals/percentages', focus: 'Numbers', description: 'Ratio, percentage conversion, complex arithmetic' },
      { subject: 'Science', topic: 'Earth/space', focus: 'Physics', description: 'Solar system, rock cycles, day/night' },
      { subject: 'Science', topic: 'Living things', focus: 'Biology', description: 'Life cycles, inheritance, evolution intro' },
      { subject: 'History', topic: 'Ancient Greeks/Egypt', focus: 'World History', description: 'Democracy, pyramids, comparisons' },
      { subject: 'Geography', topic: 'Biomes/rivers', focus: 'Physical Geo', description: 'Climate zones, water cycle, fieldwork' },
      { subject: 'Computing', topic: 'Variables/databases', focus: 'Data', description: 'Sorting data, conditional loops, interactive stories' },
      { subject: 'Modern Language', topic: 'Sentences/conversations', focus: 'Language', description: 'Adjectives, shopping, write short paragraphs' },
      { subject: 'Music', topic: 'World music/notation', focus: 'Musicology', description: 'Samba, staff notation, improvisation' },
    ]
  },

  {
    yearGroup: 'Y7-9',
    keyStage: 3,
    ageRange: '11-14 years',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'Text analysis', focus: 'Literature', description: 'Analysis skills, language techniques, essays' },
      { subject: 'Maths', topic: 'Algebra equations', focus: 'Algebra', description: 'Linear equations, substitution, multi-step solve' },
      { subject: 'Science', topic: 'Electricity circuits', focus: 'Physics', description: 'Ohm’s Law, series/parallel circuits' },
      { subject: 'Science', topic: 'Biology basics', focus: 'Biology', description: 'Cells, human systems, ecosystems' },
      { subject: 'History', topic: 'Cold War', focus: 'Modern History', description: '1945-91, superpower relations' },
      { subject: 'Geography', topic: 'Country capitals', focus: 'Locational', description: 'Global population, human geography' },
      { subject: 'Computing', topic: 'Python basics', focus: 'Development', description: 'Variables, functions, program flow' },
      { subject: 'Modern Language', topic: 'Spanish GCSE basics', focus: 'MFL', description: 'Verb tenses, basic conversations' },
      { subject: 'Music', topic: 'Music performance', focus: 'Music secondary', description: 'Ensemble playing, performance skills' },
      { subject: 'Music', topic: 'Garageband basics', focus: 'Production', description: 'Digital music creation, loops, beats' },
    ]
  },

  {
    yearGroup: 'Y10-11',
    keyStage: 4,
    ageRange: '14-16 years',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'English Language', focus: 'English Language', description: 'GCSE English Language' },
      { subject: 'English', topic: 'English Literature', focus: 'English Literature', description: 'GCSE English Literature' },
      { subject: 'Maths', topic: 'Maths', focus: 'Maths', description: 'GCSE Maths' },
      { subject: 'Science', topic: 'Science', focus: 'Science (Combined/Triple)', description: 'GCSE Biology, Chemistry, Physics' },
      { subject: 'Computing', topic: 'Computing', focus: 'Computing', description: 'GCSE Computer Science' },
      { subject: 'PE', topic: 'PE', focus: 'PE', description: 'GCSE Physical Education' },
      { subject: 'Citizenship', topic: 'Citizenship', focus: 'Citizenship', description: 'Citizenship Studies' },
      { subject: 'Modern Language', topic: 'Modern Language', focus: 'Modern Foreign Language (GCSE)', description: 'French or Spanish GCSE' },
      { subject: 'History', topic: 'History', focus: 'Humanities (GCSE)', description: 'History GCSE' },
      { subject: 'Geography', topic: 'Geography', focus: 'Humanities (GCSE)', description: 'Geography GCSE' },
    ]
  },

  {
    yearGroup: 'Y12-13',
    keyStage: 5,
    ageRange: '16-18 years',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'English Language', focus: 'A-Level English Language', description: 'Language analysis, sociolinguistics' },
      { subject: 'English', topic: 'English Literature', focus: 'A-Level English Literature', description: 'Classic and contemporary texts' },
      { subject: 'Maths', topic: 'Maths', focus: 'A-Level Mathematics', description: 'Pure, Mechanics, Statistics' },
      { subject: 'Science', topic: 'Science', focus: 'A-Level Sciences', description: 'Biology, Chemistry, Physics' },
      { subject: 'History', topic: 'History', focus: 'A-Level History', description: 'Modern world history' },
      { subject: 'Geography', topic: 'Geography', focus: 'A-Level Geography', description: 'Physical and human geography' },
      { subject: 'Modern Language', topic: 'Modern Language', focus: 'A-Level Language', description: 'French or Spanish' },
      { subject: 'Art & Design', topic: 'Art & Design', focus: 'A-Level Art & Design', description: 'Fine art, portfolio' },
      { subject: 'Computing', topic: 'Computing', focus: 'A-Level Computer Science', description: 'Programming, algorithms' },
      { subject: 'PE', topic: 'PE', focus: 'A-Level Physical Education', description: 'Theory and practical' },
    ]
  },
];

export const getCurriculumForYear = (yearGroup: ProfileTemplate): UKCurriculumYear | undefined => {
  return UK_CURRICULUM.find(c => c.yearGroup === yearGroup);
};

export const getSubjectsForYear = (yearGroup: ProfileTemplate): string[] => {
  const curriculum = getCurriculumForYear(yearGroup);
  if (!curriculum) return [];

  const subjects = new Set<string>();
  curriculum.subjects.forEach(s => subjects.add(s.subject));
  return Array.from(subjects);
};

export const getTopicsForSubject = (yearGroup: ProfileTemplate, subject: string): UKCurriculumTopic[] => {
  const curriculum = getCurriculumForYear(yearGroup);
  if (!curriculum) return [];

  return curriculum.subjects
    .filter(s => s.subject === subject)
    .sort((a, b) => a.topic.localeCompare(b.topic));
};

export const getAllTopicsForYear = (yearGroup: ProfileTemplate): UKCurriculumTopic[] => {
  const curriculum = getCurriculumForYear(yearGroup);
  return curriculum?.subjects || [];
};

export const getStatutoryCount = (yearGroup: ProfileTemplate): number => {
  const curriculum = getCurriculumForYear(yearGroup);
  return curriculum?.statutory || 0;
};

export const getYearGroupByAge = (age: number): ProfileTemplate => {
  if (age >= 5 && age <= 7) return 'Y1-2';
  if (age >= 8 && age <= 9) return 'Y3-4';
  if (age >= 10 && age <= 11) return 'Y5-6';
  if (age >= 12 && age <= 14) return 'Y7-9';
  if (age >= 15 && age <= 16) return 'Y10-11';
  return 'Y12-13';
};

export const PROFILE_TEMPLATES = [
  { id: 'Y1-2' as ProfileTemplate, label: 'Y1-2', ageRange: '5-7 years' },
  { id: 'Y3-4' as ProfileTemplate, label: 'Y3-4', ageRange: '7-9 years' },
  { id: 'Y5-6' as ProfileTemplate, label: 'Y5-6', ageRange: '9-11 years' },
  { id: 'Y7-9' as ProfileTemplate, label: 'Y7-9', ageRange: '11-14 years' },
  { id: 'Y10-11' as ProfileTemplate, label: 'Y10-11', ageRange: '14-16 years' },
  { id: 'Y12-13' as ProfileTemplate, label: 'Y12-13', ageRange: '16-18 years' },
];
