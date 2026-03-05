import { ProfileTemplate } from '../types';

export interface UKCurriculumTopic {
  subject: string;
  topic: string;
  focus: string;
  description: string;
}

export interface UKYearCurriculum {
  yearGroup: ProfileTemplate;
  statutory: number;
  subjects: UKCurriculumTopic[];
}

export const UK_CURRICULUM: UKYearCurriculum[] = [
  {
    yearGroup: 'Y1-2',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'Word reading', focus: 'Phonics, decoding, common exception words', description: 'Word reading, comprehension, spelling, composition, SPaG' },
      { subject: 'English', topic: 'Comprehension', focus: 'Listening to and discussing texts, predicting', description: 'Word reading, comprehension, spelling, composition, SPaG' },
      { subject: 'English', topic: 'Spelling', focus: 'Phonemes, spelling rules, suffixes', description: 'Word reading, comprehension, spelling, composition, SPaG' },
      { subject: 'English', topic: 'Composition', focus: 'Writing sentences, planning, editing', description: 'Word reading, comprehension, spelling, composition, SPaG' },
      { subject: 'English', topic: 'SPaG', focus: 'Grammar, punctuation, terminology', description: 'Word reading, comprehension, spelling, composition, SPaG' },
      { subject: 'Maths', topic: 'Number', focus: 'Place value, counting, 1-100', description: 'Number/place value, addition/subtraction, measures, geometry' },
      { subject: 'Maths', topic: 'Addition', focus: 'Mental and written addition/subtraction', description: 'Number/place value, addition/subtraction, measures, geometry' },
      { subject: 'Maths', topic: 'Measures', focus: 'Length, mass, capacity, time, money', description: 'Number/place value, addition/subtraction, measures, geometry' },
      { subject: 'Maths', topic: 'Geometry', focus: '2D and 3D shapes, position and direction', description: 'Number/place value, addition/subtraction, measures, geometry' },
      { subject: 'Science', topic: 'Plants', focus: 'Identifying plants, structure', description: 'Plants, Animals inc humans, Everyday materials, Seasonal change' },
      { subject: 'Science', topic: 'Animals', focus: 'Fish, amphibians, reptiles, birds, mammals', description: 'Plants, Animals inc humans, Everyday materials, Seasonal change' },
      { subject: 'Science', topic: 'Materials', focus: 'Distinguishing between objects and materials', description: 'Plants, Animals inc humans, Everyday materials, Seasonal change' },
      { subject: 'Science', topic: 'Seasons', focus: 'Seasonal changes, weather and day length', description: 'Plants, Animals inc humans, Everyday materials, Seasonal change' },
      { subject: 'Design & Technology', topic: 'Design', focus: 'Designing products for a purpose', description: 'Designing, making, using materials' },
      { subject: 'Design & Technology', topic: 'Making', focus: 'Making, evaluating and technical knowledge', description: 'Designing, making, using materials' },
      { subject: 'History', topic: 'Living Memory', focus: 'Historical changes within living memory', description: 'Changes within living memory' },
      { subject: 'Geography', topic: 'Local Area', focus: 'Identifying features of the UK and local area', description: 'UK, seasonal features' },
      { subject: 'Art & Design', topic: 'Art Skills', focus: 'Drawing, painting and craft techniques', description: 'Drawing, painting, craft' },
      { subject: 'Music', topic: 'Music Skills', focus: 'Singing and playing instruments', description: 'Singing, instruments' },
      { subject: 'PE', topic: 'Physical education', focus: 'Movement, games, swimming', description: 'Movement, games, swimming' },
      { subject: 'Computing', topic: 'Computing', focus: 'Digital literacy, basic computing', description: 'Digital literacy, basic computing' },
    ]
  },
  {
    yearGroup: 'Y3-4',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'Reading', focus: 'Word reading, comprehension', description: 'Word reading, comprehension, grammar, composition' },
      { subject: 'English', topic: 'Writing', focus: 'Grammar, composition', description: 'Word reading, comprehension, grammar, composition' },
      { subject: 'Maths', topic: 'Number', focus: 'Place value, addition/subtraction', description: 'Number, add/subtract, multiplication/division, fractions, measurement, statistics, geometry' },
      { subject: 'Maths', topic: 'Times Tables', focus: 'Multiplication and division', description: 'Number, add/subtract, multiplication/division, fractions, measurement, statistics, geometry' },
      { subject: 'Maths', topic: 'Fractions', focus: 'Fractions and decimals', description: 'Number, add/subtract, multiplication/division, fractions, measurement, statistics, geometry' },
      { subject: 'Science', topic: 'Plants', focus: 'Life cycles, structure', description: 'Plants, Animals inc humans, Rocks, Light, Forces/magnets' },
      { subject: 'Science', topic: 'Animals', focus: 'Habitats, food chains', description: 'Plants, Animals inc humans, Rocks, Light, Forces/magnets' },
      { subject: 'Science', topic: 'Rocks', focus: 'Types of rocks, fossils', description: 'Plants, Animals inc humans, Rocks, Light, Forces/magnets' },
      { subject: 'Science', topic: 'Light', focus: 'Light and shadows', description: 'Plants, Animals inc humans, Rocks, Light, Forces/magnets' },
      { subject: 'Science', topic: 'Forces', focus: 'Magnets and friction', description: 'Plants, Animals inc humans, Rocks, Light, Forces/magnets' },
      { subject: 'Design & Technology', topic: 'DT', focus: 'Designing, making, evaluation', description: 'Designing, making, evaluation' },
      { subject: 'History', topic: 'Prehistory', focus: 'Stone Age to Iron Age', description: 'Stone Age to Iron Age' },
      { subject: 'Geography', topic: 'Human Geography', focus: 'Settlement, land use', description: 'Settlement, land use' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Techniques and creativity', description: 'Art techniques, creativity' },
      { subject: 'Music', topic: 'Performance', focus: 'Singing, playing, composing', description: 'Performance, composition' },
      { subject: 'PE', topic: 'PE', focus: 'Games, athletics, swimming', description: 'Games, athletics, swimming' },
      { subject: 'Computing', topic: 'Computing', focus: 'Programming, digital skills', description: 'Programming, digital skills' },
      { subject: 'Modern Language', topic: 'French', focus: 'French basics', description: 'French or Spanish basics' },
      { subject: 'Modern Language', topic: 'Spanish', focus: 'Spanish basics', description: 'French or Spanish basics' },
    ]
  },
  {
    yearGroup: 'Y5-6',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'Comprehension', focus: 'Advanced reading and themes', description: 'Word reading, comprehension (themes), advanced grammar, composition, SPaG' },
      { subject: 'English', topic: 'Writing', focus: 'Composition and advanced grammar', description: 'Word reading, comprehension (themes), advanced grammar, composition, SPaG' },
      { subject: 'English', topic: 'SPaG', focus: 'Grammar, punctuation and spelling', description: 'Word reading, comprehension (themes), advanced grammar, composition, SPaG' },
      { subject: 'Maths', topic: 'Numbers', focus: 'Advanced number work', description: 'Number, add/subtract, multiplication/division, fractions/decimals/%, measurement, geometry, statistics' },
      { subject: 'Maths', topic: 'Calculations', focus: 'Multiplication/division, fractions/decimals/%', description: 'Number, add/subtract, multiplication/division, fractions/decimals/%, measurement, geometry, statistics' },
      { subject: 'Maths', topic: 'Data', focus: 'Geometry and statistics', description: 'Number, add/subtract, multiplication/division, fractions/decimals/%, measurement, geometry, statistics' },
      { subject: 'Science', topic: 'Life Processes', focus: 'Living things and habitats', description: 'Living things/habitats, Animals inc humans, Materials/states, Earth/space, Forces' },
      { subject: 'Science', topic: 'Earth & Space', focus: 'Planets and solar system', description: 'Living things/habitats, Animals inc humans, Materials/states, Earth/space, Forces' },
      { subject: 'Science', topic: 'Physics', focus: 'Electricity and forces', description: 'Living things/habitats, Animals inc humans, Materials/states, Earth/space, Forces' },
      { subject: 'Design & Technology', topic: 'DT', focus: 'Designing, making, technical knowledge', description: 'Designing, making, technical knowledge' },
      { subject: 'History', topic: 'Ancient History', focus: 'Ancient Greece', description: 'Ancient Greece, British history' },
      { subject: 'History', topic: 'British History', focus: 'British historical periods', description: 'Ancient Greece, British history' },
      { subject: 'Geography', topic: 'Environment', focus: 'Biomes, climate, features', description: 'Biomes, climate, physical features' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Techniques and observation', description: 'Art techniques, observation' },
      { subject: 'Music', topic: 'Music', focus: 'Performance, composition, appraisal', description: 'Performance, composition, appraisal' },
      { subject: 'PE', topic: 'PE', focus: 'Games, athletics, swimming', description: 'Games, athletics, swimming' },
      { subject: 'Computing', topic: 'Coding', focus: 'Programming, algorithms, debugging', description: 'Programming, algorithms, debugging' },
      { subject: 'Modern Language', topic: 'Modern Language', focus: 'French or Spanish vocab', description: 'French or Spanish vocabulary, grammar' },
    ]
  },
  {
    yearGroup: 'Y7-9',
    statutory: 12,
    subjects: [
      { subject: 'English', topic: 'Reading', focus: 'Literary analysis', description: 'Reading, writing, spoken language' },
      { subject: 'English', topic: 'Writing', focus: 'Composition skills', description: 'Reading, writing, spoken language' },
      { subject: 'Maths', topic: 'Algebra', focus: 'Equations and identities', description: 'Number, algebra, geometry, statistics' },
      { subject: 'Maths', topic: 'Geometry', focus: 'Shape and space', description: 'Number, algebra, geometry, statistics' },
      { subject: 'Science', topic: 'Biology', focus: 'Cells, genetics, ecology', description: 'Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Chemistry', focus: 'Atomic structure, reactions', description: 'Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Physics', focus: 'Forces, energy, space', description: 'Biology, Chemistry, Physics' },
      { subject: 'Citizenship', topic: 'Democracy', focus: 'Government, rights, law', description: 'Democracy, rights, responsibilities' },
      { subject: 'Computing', topic: 'Computing', focus: 'Computer science, digital literacy', description: 'Computing, digital literacy' },
      { subject: 'Design & Technology', topic: 'DT', focus: 'Design, making, technology', description: 'Design, making, technology' },
      { subject: 'Modern Language', topic: 'Languages', focus: 'Modern Foreign Languages', description: 'Languages' },
      { subject: 'Geography', topic: 'Geography', focus: 'Physical and human geography', description: 'Physical and human geography' },
      { subject: 'History', topic: 'History', focus: 'British and world history', description: 'British and world history' },
      { subject: 'Music', topic: 'Music', focus: 'Performance, composition', description: 'Music performance, composition' },
      { subject: 'Art & Design', topic: 'Art', focus: 'Art and design', description: 'Art and design' },
      { subject: 'PE', topic: 'PE', focus: 'Physical education', description: 'Physical education' },
    ]
  },
  {
    yearGroup: 'Y10-11',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'English Language', focus: 'GCSE Language Paper 1 & 2', description: 'GCSE English Language' },
      { subject: 'English', topic: 'English Literature', focus: 'GCSE Literature Texts', description: 'GCSE English Literature' },
      { subject: 'Maths', topic: 'GCSE Maths', focus: 'Foundation or Higher Tier', description: 'GCSE Maths' },
      { subject: 'Science', topic: 'Combined Science', focus: 'Biology, Chemistry, Physics', description: 'GCSE Biology, Chemistry, Physics (Combined/Triple)' },
      { subject: 'Science', topic: 'Triple Science', focus: 'Separate Sci awards', description: 'GCSE Biology, Chemistry, Physics (Combined/Triple)' },
      { subject: 'Computing', topic: 'Computer Science', focus: 'Theory and Programming', description: 'GCSE Computer Science' },
      { subject: 'PE', topic: 'PE', focus: 'Physical Education', description: 'GCSE Physical Education' },
      { subject: 'Citizenship', topic: 'Citizenship', focus: 'Citizenship Studies', description: 'Citizenship Studies' },
      { subject: 'Modern Language', topic: 'Modern Language', focus: 'GCSE French or Spanish', description: 'GCSE French or Spanish' },
      { subject: 'History', topic: 'History', focus: 'GCSE History', description: 'GCSE History' },
      { subject: 'Geography', topic: 'Geography', focus: 'GCSE Geography', description: 'GCSE Geography' },
    ]
  },
  {
    yearGroup: 'Y12-13',
    statutory: 10,
    subjects: [
      { subject: 'English', topic: 'English Language', focus: 'A-Level Language', description: 'A-Level English Language' },
      { subject: 'English', topic: 'English Literature', focus: 'A-Level Literature', description: 'A-Level English Literature' },
      { subject: 'Maths', topic: 'Mathematics', focus: 'Pure, Mechanics, Stats', description: 'A-Level Mathematics (Pure, Mechanics, Statistics)' },
      { subject: 'Science', topic: 'Biology', focus: 'A-Level Biology', description: 'A-Level Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Chemistry', focus: 'A-Level Chemistry', description: 'A-Level Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Physics', focus: 'A-Level Physics', description: 'A-Level Biology, Chemistry, Physics' },
      { subject: 'History', topic: 'History', focus: 'A-Level History', description: 'A-Level History' },
      { subject: 'Geography', topic: 'Geography', focus: 'A-Level Geography', description: 'A-Level Geography' },
      { subject: 'Art & Design', topic: 'Art', focus: 'A-Level Art & Design', description: 'A-Level Art & Design' },
      { subject: 'Computing', topic: 'Computing', focus: 'A-Level Computer Science', description: 'A-Level Computer Science' },
    ]
  }
];

export const getCurriculumForYear = (yearGroup: ProfileTemplate): UKYearCurriculum | undefined => {
  return UK_CURRICULUM.find(y => y.yearGroup === yearGroup);
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
