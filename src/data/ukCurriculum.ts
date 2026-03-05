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
    ageRange: '5-7 years',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'Word reading', focus: 'Phonics', description: 'Word reading, comprehension, spelling, composition, SPaG' },
      { subject: 'Maths', topic: 'Number', focus: 'Arithmetic', description: 'Number/place value, addition/subtraction, measures, geometry' },
      { subject: 'Science', topic: 'Plants', focus: 'Biology', description: 'Plants, Animals inc humans' },
      { subject: 'Science', topic: 'Materials', focus: 'Chemistry', description: 'Everyday materials, Seasonal change' },
      { subject: 'Design & Technology', topic: 'Design & Technology', focus: 'DT', description: 'Designing, making, using materials' },
      { subject: 'History', topic: 'Changes', focus: 'History', description: 'Changes within living memory' },
      { subject: 'Geography', topic: 'UK', focus: 'Geography', description: 'UK, seasonal features' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Creative', description: 'Drawing, painting, craft' },
      { subject: 'Music', topic: 'Music', focus: 'Performance', description: 'Singing, instruments' },
      { subject: 'PE', topic: 'PE', focus: 'Physical', description: 'Movement, games, swimming' },
      { subject: 'Computing', topic: 'Computing', focus: 'Digital', description: 'Digital literacy, basic computing' },
    ]
  },

  {
    yearGroup: 'Y3-4',
    keyStage: 2,
    ageRange: '7-9 years',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'English', focus: 'Literacy', description: 'Word reading, comprehension, grammar, composition' },
      { subject: 'Maths', topic: 'Maths', focus: 'Arithmetic', description: 'Number, add/subtract, multiplication/division, fractions, measurement, statistics, geometry' },
      { subject: 'Science', topic: 'Science', focus: 'Biology', description: 'Plants, Animals inc humans, Rocks, Light' },
      { subject: 'Science', topic: 'Forces', focus: 'Physics', description: 'Forces/magnets' },
      { subject: 'Design & Technology', topic: 'Design & Technology', focus: 'DT', description: 'Designing, making, evaluation' },
      { subject: 'History', topic: 'History', focus: 'British History', description: 'Stone Age to Iron Age' },
      { subject: 'Geography', topic: 'Geography', focus: 'Human Geography', description: 'Settlement, land use' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Creative', description: 'Art techniques, creativity' },
      { subject: 'Music', topic: 'Music', focus: 'Performance', description: 'Performance, composition' },
      { subject: 'PE', topic: 'PE', focus: 'Physical', description: 'Games, athletics, swimming' },
      { subject: 'Computing', topic: 'Computing', focus: 'Programming', description: 'Programming, digital skills' },
      { subject: 'Modern Language', topic: 'MFL', focus: 'Language', description: 'French or Spanish basics' },
    ]
  },

  {
    yearGroup: 'Y5-6',
    keyStage: 2,
    ageRange: '9-11 years',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'English', focus: 'Literacy', description: 'Word reading, comprehension (themes), advanced grammar, composition, SPaG' },
      { subject: 'Maths', topic: 'Maths', focus: 'Numbers', description: 'Number, add/subtract, multiplication/division, fractions/decimals/%, measurement, geometry, statistics' },
      { subject: 'Science', topic: 'Living things', focus: 'Biology', description: 'Living things/habitats, Animals inc humans' },
      { subject: 'Science', topic: 'Materials', focus: 'Chemistry', description: 'Materials/states, Earth/space' },
      { subject: 'Science', topic: 'Forces', focus: 'Physics', description: 'Forces' },
      { subject: 'Design & Technology', topic: 'Design & Technology', focus: 'DT', description: 'Designing, making, technical knowledge' },
      { subject: 'History', topic: 'History', focus: 'World History', description: 'Ancient Greece, British history' },
      { subject: 'Geography', topic: 'Geography', focus: 'Physical Geo', description: 'Biomes, climate, physical features' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Creative', description: 'Art techniques, observation' },
      { subject: 'Music', topic: 'Music', focus: 'Performance', description: 'Performance, composition, appraisal' },
      { subject: 'PE', topic: 'PE', focus: 'Physical', description: 'Games, athletics, swimming' },
      { subject: 'Computing', topic: 'Computing', focus: 'Programming', description: 'Programming, algorithms, debugging' },
      { subject: 'Modern Language', topic: 'MFL', focus: 'Language', description: 'French or Spanish vocabulary, grammar' },
    ]
  },

  {
    yearGroup: 'Y7-9',
    keyStage: 3,
    ageRange: '11-14 years',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'English', focus: 'Literature', description: 'Reading, writing, spoken language' },
      { subject: 'Maths', topic: 'Maths', focus: 'Algebra', description: 'Number, algebra, geometry, statistics' },
      { subject: 'Science', topic: 'Biology', focus: 'Science', description: 'Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Chemistry', focus: 'Science', description: 'Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Physics', focus: 'Science', description: 'Biology, Chemistry, Physics' },
      { subject: 'Citizenship', topic: 'Citizenship', focus: 'Citizenship', description: 'Democracy, rights, responsibilities' },
      { subject: 'Computing', topic: 'Computing', focus: 'Digital', description: 'Computing, digital literacy' },
      { subject: 'Design & Technology', topic: 'D&T', focus: 'DT', description: 'Design, making, technology' },
      { subject: 'Modern Foreign Languages', topic: 'MFL', focus: 'Language', description: 'Languages' },
      { subject: 'Geography', topic: 'Geography', focus: 'Geography', description: 'Physical and human geography' },
      { subject: 'History', topic: 'History', focus: 'History', description: 'British and world history' },
      { subject: 'Music', topic: 'Music', focus: 'Performance', description: 'Music performance, composition' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Creative', description: 'Art and design' },
      { subject: 'PE', topic: 'PE', focus: 'Physical', description: 'Physical education' },
    ]
  },

  {
    yearGroup: 'Y10-11',
    keyStage: 4,
    ageRange: '14-16 years',
    statutory: 10,
    subjects: [
      { subject: 'English Language', topic: 'English Language', focus: 'GCSE', description: 'GCSE English Language' },
      { subject: 'English Literature', topic: 'English Literature', focus: 'GCSE', description: 'GCSE English Literature' },
      { subject: 'Maths', topic: 'Maths', focus: 'GCSE', description: 'GCSE Maths' },
      { subject: 'Science', topic: 'Science', focus: 'GCSE', description: 'GCSE Biology, Chemistry, Physics (Combined/Triple)' },
      { subject: 'Computing', topic: 'Computing', focus: 'GCSE', description: 'GCSE Computer Science' },
      { subject: 'PE', topic: 'PE', focus: 'GCSE', description: 'GCSE Physical Education' },
      { subject: 'Citizenship', topic: 'Citizenship', focus: 'GCSE', description: 'Citizenship Studies' },
      { subject: 'Modern Language', topic: 'MFL', focus: 'GCSE', description: 'French or Spanish GCSE' },
      { subject: 'History', topic: 'History', focus: 'GCSE', description: 'GCSE History' },
      { subject: 'Geography', topic: 'Geography', focus: 'GCSE', description: 'GCSE Geography' },
    ]
  },

  {
    yearGroup: 'Y12-13',
    keyStage: 5,
    ageRange: '16-18 years',
    statutory: 10,
    subjects: [
      { subject: 'English Language', topic: 'English Language', focus: 'A-Level', description: 'A-Level English Language' },
      { subject: 'English Literature', topic: 'English Literature', focus: 'A-Level', description: 'A-Level English Literature' },
      { subject: 'Maths', topic: 'Maths', focus: 'A-Level', description: 'A-Level Mathematics (Pure, Mechanics, Statistics)' },
      { subject: 'Science', topic: 'Science', focus: 'A-Level', description: 'A-Level Biology, Chemistry, Physics' },
      { subject: 'History', topic: 'History', focus: 'A-Level', description: 'A-Level History' },
      { subject: 'Geography', topic: 'Geography', focus: 'A-Level', description: 'A-Level Geography' },
      { subject: 'Modern Language', topic: 'MFL', focus: 'A-Level', description: 'A-Level French or Spanish' },
      { subject: 'Art & Design', topic: 'Art & Design', focus: 'A-Level', description: 'A-Level Art & Design' },
      { subject: 'Computing', topic: 'Computing', focus: 'A-Level', description: 'A-Level Computer Science' },
      { subject: 'PE', topic: 'PE', focus: 'A-Level', description: 'A-Level Physical Education' },
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
