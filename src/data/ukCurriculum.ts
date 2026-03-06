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
      { subject: 'English', topic: 'Phonics', focus: 'Word reading', description: 'Phonics, Reading, Writing, SPaG' },
      { subject: 'English', topic: 'Reading', focus: 'Comprehension', description: 'Phonics, Reading, Writing, SPaG' },
      { subject: 'English', topic: 'Writing', focus: 'Composition', description: 'Phonics, Reading, Writing, SPaG' },
      { subject: 'English', topic: 'Speaking/Listening', focus: 'Spoken language', description: 'Phonics, Reading, Writing, SPaG' },
      { subject: 'Maths', topic: 'Number', focus: 'Place value', description: 'Number, Addition, Subtraction, Measures, Geometry' },
      { subject: 'Maths', topic: 'Addition/Subtraction', focus: 'Calculations', description: 'Number, Addition, Subtraction, Measures, Geometry' },
      { subject: 'Maths', topic: 'Shapes', focus: 'Geometry', description: 'Number, Addition, Subtraction, Measures, Geometry' },
      { subject: 'Maths', topic: 'Measures', focus: 'Measurement', description: 'Number, Addition, Subtraction, Measures, Geometry' },
      { subject: 'Science', topic: 'Plants', focus: 'Biology', description: 'Plants, Animals, Materials, Seasonal Change' },
      { subject: 'Science', topic: 'Animals', focus: 'Biology', description: 'Plants, Animals, Materials, Seasonal Change' },
      { subject: 'Science', topic: 'Materials', focus: 'Chemistry', description: 'Plants, Animals, Materials, Seasonal Change' },
      { subject: 'Science', topic: 'Weather/Seasons', focus: 'Physics/Geography', description: 'Plants, Animals, Materials, Seasonal Change' },
      { subject: 'Design & Technology', topic: 'Designing', focus: 'DT Skills', description: 'Designing, Making' },
      { subject: 'Design & Technology', topic: 'Making', focus: 'DT Skills', description: 'Designing, Making' },
      { subject: 'Design & Technology', topic: 'Tools', focus: 'DT Skills', description: 'Designing, Making' },
      { subject: 'History', topic: 'Changes in Living Memory', focus: 'History', description: 'Changes within living memory' },
      { subject: 'History', topic: 'Past Events', focus: 'History', description: 'Changes within living memory' },
      { subject: 'Geography', topic: 'My Local Area', focus: 'Geography', description: 'UK, Seasonal features' },
      { subject: 'Geography', topic: 'UK Features', focus: 'Geography', description: 'UK, Seasonal features' },
      { subject: 'Art & Design', topic: 'Drawing', focus: 'Art', description: 'Drawing, Painting' },
      { subject: 'Art & Design', topic: 'Painting', focus: 'Art', description: 'Drawing, Painting' },
      { subject: 'Art & Design', topic: 'Colour', focus: 'Art', description: 'Drawing, Painting' },
      { subject: 'Music', topic: 'Singing', focus: 'Music', description: 'Singing, Instruments' },
      { subject: 'Music', topic: 'Instruments', focus: 'Music', description: 'Singing, Instruments' },
      { subject: 'Music', topic: 'Listening', focus: 'Music', description: 'Singing, Instruments' },
      { subject: 'PE', topic: 'Movement', focus: 'Physical Education', description: 'Movement, Games, Swimming' },
      { subject: 'PE', topic: 'Games', focus: 'Physical Education', description: 'Movement, Games, Swimming' },
      { subject: 'PE', topic: 'Swimming', focus: 'Physical Education', description: 'Movement, Games, Swimming' },
      { subject: 'Computing', topic: 'Using Computers', focus: 'IT Skills', description: 'Digital literacy' },
      { subject: 'Computing', topic: 'Programming Basics', focus: 'Computer Science', description: 'Digital literacy' },
      { subject: 'Computing', topic: 'Online Safety', focus: 'e-Safety', description: 'Digital literacy' },
    ]
  },
  {
    yearGroup: 'Y3-4',
    statutory: 13,
    subjects: [
      { subject: 'English', topic: 'Reading', focus: 'Comprehension', description: 'Reading, Writing, Grammar' },
      { subject: 'English', topic: 'Writing', focus: 'Composition', description: 'Reading, Writing, Grammar' },
      { subject: 'English', topic: 'Grammar', focus: 'SPaG', description: 'Reading, Writing, Grammar' },
      { subject: 'English', topic: 'Spelling', focus: 'SPaG', description: 'Reading, Writing, Grammar' },
      { subject: 'English', topic: 'Handwriting', focus: 'Writing Skills', description: 'Reading, Writing, Grammar' },
      { subject: 'Maths', topic: 'Number', focus: 'Place value', description: 'Number, Times Tables, Fractions' },
      { subject: 'Maths', topic: 'Times Tables', focus: 'Multiplication', description: 'Number, Times Tables, Fractions' },
      { subject: 'Maths', topic: 'Fractions', focus: 'Decimals/Fractions', description: 'Number, Times Tables, Fractions' },
      { subject: 'Maths', topic: 'Measures', focus: 'Measurement', description: 'Number, Times Tables, Fractions' },
      { subject: 'Maths', topic: 'Geometry', focus: 'Shapes/Space', description: 'Number, Times Tables, Fractions' },
      { subject: 'Science', topic: 'Rocks', focus: 'Chemistry/Geology', description: 'Rocks, Light, Forces, Magnets' },
      { subject: 'Science', topic: 'Light', focus: 'Physics', description: 'Rocks, Light, Forces, Magnets' },
      { subject: 'Science', topic: 'Forces', focus: 'Physics', description: 'Rocks, Light, Forces, Magnets' },
      { subject: 'Science', topic: 'Magnets', focus: 'Physics', description: 'Rocks, Light, Forces, Magnets' },
      { subject: 'Science', topic: 'Living Things', focus: 'Biology', description: 'Rocks, Light, Forces, Magnets' },
      { subject: 'Design & Technology', topic: 'Designing', focus: 'DT Skills', description: 'Designing, Making' },
      { subject: 'Design & Technology', topic: 'Making', focus: 'DT Skills', description: 'Designing, Making' },
      { subject: 'Design & Technology', topic: 'Materials', focus: 'DT Skills', description: 'Designing, Making' },
      { subject: 'History', topic: 'Stone Age', focus: 'Prehistory', description: 'Stone Age to iron age, Romans, Vikings' },
      { subject: 'History', topic: 'Iron Age', focus: 'Prehistory', description: 'Stone Age to iron age, Romans, Vikings' },
      { subject: 'History', topic: 'Romans', focus: 'Invasion/Empire', description: 'Stone Age to iron age, Romans, Vikings' },
      { subject: 'History', topic: 'Vikings', focus: 'Invasion/Empire', description: 'Stone Age to iron age, Romans, Vikings' },
      { subject: 'Geography', topic: 'Settlements', focus: 'Human Geography', description: 'Settlement, Land use, Rivers, Mountains' },
      { subject: 'Geography', topic: 'Land Use', focus: 'Human Geography', description: 'Settlement, Land use, Rivers, Mountains' },
      { subject: 'Geography', topic: 'Rivers', focus: 'Physical Geography', description: 'Settlement, Land use, Rivers, Mountains' },
      { subject: 'Geography', topic: 'Mountains', focus: 'Physical Geography', description: 'Settlement, Land use, Rivers, Mountains' },
      { subject: 'Geography', topic: 'Weather', focus: 'Physical Geography', description: 'Settlement, Land use, Rivers, Mountains' },
      { subject: 'Art & Design', topic: 'Drawing', focus: 'Art', description: 'Art techniques' },
      { subject: 'Art & Design', topic: 'Painting', focus: 'Art', description: 'Art techniques' },
      { subject: 'Art & Design', topic: '3D Work', focus: 'Art', description: 'Art techniques' },
      { subject: 'Music', topic: 'Singing', focus: 'Music', description: 'Performance, Composition' },
      { subject: 'Music', topic: 'Playing', focus: 'Music', description: 'Performance, Composition' },
      { subject: 'Music', topic: 'Composing', focus: 'Music', description: 'Performance, Composition' },
      { subject: 'PE', topic: 'Games', focus: 'Physical Education', description: 'Games, Athletics, Swimming' },
      { subject: 'PE', topic: 'Athletics', focus: 'Physical Education', description: 'Games, Athletics, Swimming' },
      { subject: 'PE', topic: 'Swimming', focus: 'Physical Education', description: 'Games, Athletics, Swimming' },
      { subject: 'PE', topic: 'Gymnastics', focus: 'Physical Education', description: 'Games, Athletics, Swimming' },
      { subject: 'Computing', topic: 'Programming', focus: 'Computer Science', description: 'Programming' },
      { subject: 'Computing', topic: 'Data Handling', focus: 'IT Skills', description: 'Programming' },
      { subject: 'Computing', topic: 'Digital Literacy', focus: 'IT Skills', description: 'Programming' },
      { subject: 'French', topic: 'French', focus: 'Modern Languages', description: 'Basic French vocabulary and phrases' },
      { subject: 'Spanish', topic: 'Spanish', focus: 'Modern Languages', description: 'Basic Spanish vocabulary and phrases' },
      { subject: 'German', topic: 'German', focus: 'Modern Languages', description: 'Basic German vocabulary and phrases' },
    ]
  },
  {
    yearGroup: 'Y5-6',
    statutory: 13,
    subjects: [
      { subject: 'English', topic: 'Comprehension', focus: 'Advanced Reading', description: 'Comprehension, Composition, SPaG' },
      { subject: 'English', topic: 'Writing', focus: 'Composition', description: 'Comprehension, Composition, SPaG' },
      { subject: 'English', topic: 'Grammar', focus: 'SPaG', description: 'Comprehension, Composition, SPaG' },
      { subject: 'English', topic: 'SPaG', focus: 'SPaG', description: 'Comprehension, Composition, SPaG' },
      { subject: 'English', topic: 'Shakespeare', focus: 'Literature', description: 'Comprehension, Composition, SPaG' },
      { subject: 'Maths', topic: 'Fractions', focus: 'Decimals/Fractions', description: 'Fractions, Decimals, Geometry' },
      { subject: 'Maths', topic: 'Decimals', focus: 'Decimals/Fractions', description: 'Fractions, Decimals, Geometry' },
      { subject: 'Maths', topic: 'Percentages', focus: 'Decimals/Fractions', description: 'Fractions, Decimals, Geometry' },
      { subject: 'Maths', topic: 'Geometry', focus: 'Shape/Space', description: 'Fractions, Decimals, Geometry' },
      { subject: 'Maths', topic: 'Algebra', focus: 'Introduction to Algebra', description: 'Fractions, Decimals, Geometry' },
      { subject: 'Science', topic: 'Earth/Space', focus: 'Physics', description: 'Earth/space, Forces, Living things' },
      { subject: 'Science', topic: 'Forces', focus: 'Physics', description: 'Earth/space, Forces, Living things' },
      { subject: 'Science', topic: 'Living Things', focus: 'Biology', description: 'Earth/space, Forces, Living things' },
      { subject: 'Science', topic: 'Evolution', focus: 'Biology', description: 'Earth/space, Forces, Living things' },
      { subject: 'Science', topic: 'Electricity', focus: 'Physics', description: 'Earth/space, Forces, Living things' },
      { subject: 'Design & Technology', topic: 'Technical Design', focus: 'DT Skills', description: 'Technical knowledge' },
      { subject: 'Design & Technology', topic: 'Materials', focus: 'DT Skills', description: 'Technical knowledge' },
      { subject: 'Design & Technology', topic: 'Food Technology', focus: 'DT Skills', description: 'Technical knowledge' },
      { subject: 'History', topic: 'Ancient Greece', focus: 'History', description: 'Ancient Greece, WW2, Victorians' },
      { subject: 'History', topic: 'WW2', focus: 'History', description: 'Ancient Greece, WW2, Victorians' },
      { subject: 'History', topic: 'Victorians', focus: 'History', description: 'Ancient Greece, WW2, Victorians' },
      { subject: 'History', topic: 'Early Civilisations', focus: 'History', description: 'Ancient Greece, WW2, Victorians' },
      { subject: 'Geography', topic: 'Biomes', focus: 'Physical Geography', description: 'Biomes, Climate, Trade, Maps' },
      { subject: 'Geography', topic: 'Climate', focus: 'Physical Geography', description: 'Biomes, Climate, Trade, Maps' },
      { subject: 'Geography', topic: 'Trade', focus: 'Human Geography', description: 'Biomes, Climate, Trade, Maps' },
      { subject: 'Geography', topic: 'Maps', focus: 'Fieldwork', description: 'Biomes, Climate, Trade, Maps' },
      { subject: 'Geography', topic: 'Fieldwork', focus: 'Fieldwork', description: 'Biomes, Climate, Trade, Maps' },
      { subject: 'Art & Design', topic: 'Drawing', focus: 'Art', description: 'Observation' },
      { subject: 'Art & Design', topic: 'Painting', focus: 'Art', description: 'Observation' },
      { subject: 'Art & Design', topic: 'Printmaking', focus: 'Art', description: 'Observation' },
      { subject: 'Music', topic: 'Composition', focus: 'Music', description: 'Composition, Appraisal' },
      { subject: 'Music', topic: 'Performance', focus: 'Music', description: 'Composition, Appraisal' },
      { subject: 'Music', topic: 'Appraising', focus: 'Music', description: 'Composition, Appraisal' },
      { subject: 'PE', topic: 'Athletics', focus: 'Physical Education', description: 'Athletics, Swimming' },
      { subject: 'PE', topic: 'Swimming', focus: 'Physical Education', description: 'Athletics, Swimming' },
      { subject: 'PE', topic: 'Games', focus: 'Physical Education', description: 'Athletics, Swimming' },
      { subject: 'PE', topic: 'Dance', focus: 'Physical Education', description: 'Athletics, Swimming' },
      { subject: 'Computing', topic: 'Algorithms', focus: 'Computer Science', description: 'Algorithms' },
      { subject: 'Computing', topic: 'Coding', focus: 'Computer Science', description: 'Algorithms' },
      { subject: 'Computing', topic: 'E-Safety', focus: 'IT Skills', description: 'Algorithms' },
      { subject: 'French', topic: 'French', focus: 'Modern Languages', description: 'French vocabulary, grammar, conversation' },
      { subject: 'Spanish', topic: 'Spanish', focus: 'Modern Languages', description: 'Spanish vocabulary, grammar, conversation' },
      { subject: 'German', topic: 'German', focus: 'Modern Languages', description: 'German vocabulary, grammar, conversation' },
    ]
  },
  {
    yearGroup: 'Y7-9',
    statutory: 14,
    subjects: [
      { subject: 'English', topic: 'Reading', focus: 'Literary analysis', description: 'Reading, Writing, Spoken' },
      { subject: 'English', topic: 'Writing', focus: 'Composition', description: 'Reading, Writing, Spoken' },
      { subject: 'English', topic: 'Spoken Language', focus: 'Speaking Skills', description: 'Reading, Writing, Spoken' },
      { subject: 'Maths', topic: 'Number', focus: 'Calculations', description: 'Algebra, Geometry, Statistics' },
      { subject: 'Maths', topic: 'Algebra', focus: 'Equations/Identities', description: 'Algebra, Geometry, Statistics' },
      { subject: 'Maths', topic: 'Geometry', focus: 'Shape/Space', description: 'Algebra, Geometry, Statistics' },
      { subject: 'Maths', topic: 'Statistics', focus: 'Data Handling', description: 'Algebra, Geometry, Statistics' },
      { subject: 'Maths', topic: 'Ratio/Proportion', focus: 'Ratio', description: 'Algebra, Geometry, Statistics' },
      { subject: 'Science', topic: 'Biology', focus: 'Cells/Genetics', description: 'Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Chemistry', focus: 'Atomic structure', description: 'Biology, Chemistry, Physics' },
      { subject: 'Science', topic: 'Physics', focus: 'Forces/Energy', description: 'Biology, Chemistry, Physics' },
      { subject: 'Citizenship', topic: 'Democracy', focus: 'Government', description: 'Democracy, Rights' },
      { subject: 'Citizenship', topic: 'Government', focus: 'Democracy', description: 'Democracy, Rights' },
      { subject: 'Citizenship', topic: 'Rights', focus: 'Law', description: 'Democracy, Rights' },
      { subject: 'Citizenship', topic: 'Law', focus: 'Rights', description: 'Democracy, Rights' },
      { subject: 'Computing', topic: 'Algorithms', focus: 'Computer Science', description: 'Digital literacy' },
      { subject: 'Computing', topic: 'Programming', focus: 'Computer Science', description: 'Digital literacy' },
      { subject: 'Computing', topic: 'Data', focus: 'Computer Science', description: 'Digital literacy' },
      { subject: 'Computing', topic: 'Computer Systems', focus: 'Computer Science', description: 'Digital literacy' },
      { subject: 'Design & Technology', topic: 'Design', focus: 'DT Skills', description: 'Design, Making' },
      { subject: 'Design & Technology', topic: 'Making', focus: 'DT Skills', description: 'Design, Making' },
      { subject: 'Design & Technology', topic: 'Cooking', focus: 'Food Tech', description: 'Design, Making' },
      { subject: 'French', topic: 'French', focus: 'Modern Languages', description: 'French language skills' },
      { subject: 'Spanish', topic: 'Spanish', focus: 'Modern Languages', description: 'Spanish language skills' },
      { subject: 'German', topic: 'German', focus: 'Modern Languages', description: 'German language skills' },
      { subject: 'Geography', topic: 'Place Knowledge', focus: 'Geography', description: 'Physical, Human' },
      { subject: 'Geography', topic: 'Human Geography', focus: 'Geography', description: 'Physical, Human' },
      { subject: 'Geography', topic: 'Physical Geography', focus: 'Geography', description: 'Physical, Human' },
      { subject: 'History', topic: 'Britain 1066-1500', focus: 'History', description: 'British, World' },
      { subject: 'History', topic: 'Britain 1500-Present', focus: 'History', description: 'British, World' },
      { subject: 'History', topic: 'Wider World', focus: 'History', description: 'British, World' },
      { subject: 'Music', topic: 'Performing', focus: 'Music', description: 'Performance' },
      { subject: 'Music', topic: 'Composing', focus: 'Music', description: 'Performance' },
      { subject: 'Music', topic: 'Listening', focus: 'Music', description: 'Performance' },
      { subject: 'Music', topic: 'Music Theory', focus: 'Music', description: 'Performance' },
      { subject: 'Music', topic: 'Digital Music', focus: 'Music', description: 'Performance' },
      { subject: 'Music', topic: 'Ensemble', focus: 'Music', description: 'Performance' },
      { subject: 'Art & Design', topic: 'Drawing', focus: 'Art', description: 'Art and design' },
      { subject: 'Art & Design', topic: 'Painting', focus: 'Art', description: 'Art and design' },
      { subject: 'Art & Design', topic: 'Sculpture', focus: 'Art', description: 'Art and design' },
      { subject: 'Art & Design', topic: 'Art History', focus: 'Art', description: 'Art and design' },
      { subject: 'Art & Design', topic: 'Digital Art', focus: 'Art', description: 'Art and design' },
      { subject: 'Art & Design', topic: 'Printmaking', focus: 'Art', description: 'Art and design' },
      { subject: 'PE', topic: 'Games', focus: 'Physical Education', description: 'Physical education' },
      { subject: 'PE', topic: 'Athletics', focus: 'Physical Education', description: 'Physical education' },
      { subject: 'PE', topic: 'Swimming', focus: 'Physical Education', description: 'Physical education' },
      { subject: 'PE', topic: 'Dance', focus: 'Physical Education', description: 'Physical education' },
      { subject: 'PE', topic: 'Gymnastics', focus: 'Physical Education', description: 'Physical education' },
    ]
  },
  {
    yearGroup: 'Y10-11',
    statutory: 15,
    subjects: [
      { subject: 'English', topic: 'English Language', focus: 'GCSE Language', description: 'GCSE English Language' },
      { subject: 'English', topic: 'English Literature', focus: 'GCSE Literature', description: 'GCSE English Literature' },
      { subject: 'Maths', topic: 'GCSE Maths', focus: 'GCSE Mathematics', description: 'GCSE Maths' },
      { subject: 'Science', topic: 'Combined Science', focus: 'GCSE Combined Science', description: 'GCSE Combined Science' },
      { subject: 'Biology', topic: 'Cell Biology', focus: 'GCSE Biology', description: 'GCSE Biology' },
      { subject: 'Biology', topic: 'Organisation', focus: 'GCSE Biology', description: 'GCSE Biology' },
      { subject: 'Chemistry', topic: 'Atomic Structure', focus: 'GCSE Chemistry', description: 'GCSE Chemistry' },
      { subject: 'Chemistry', topic: 'Bonding', focus: 'GCSE Chemistry', description: 'GCSE Chemistry' },
      { subject: 'Physics', topic: 'Forces', focus: 'GCSE Physics', description: 'GCSE Physics' },
      { subject: 'Physics', topic: 'Energy', focus: 'GCSE Physics', description: 'GCSE Physics' },
      { subject: 'Computing', topic: 'Computer Science', focus: 'GCSE CS', description: 'GCSE Computer Science' },
      { subject: 'PE', topic: 'GCSE PE', focus: 'GCSE PE', description: 'GCSE PE' },
      { subject: 'Citizenship', topic: 'Citizenship', focus: 'GCSE Citizenship', description: 'Citizenship Studies' },
      { subject: 'French', topic: 'French', focus: 'GCSE Modern Languages', description: 'GCSE French' },
      { subject: 'Spanish', topic: 'Spanish', focus: 'GCSE Modern Languages', description: 'GCSE Spanish' },
      { subject: 'German', topic: 'German', focus: 'GCSE Modern Languages', description: 'GCSE German' },
      { subject: 'History', topic: 'History', focus: 'GCSE History', description: 'GCSE History' },
      { subject: 'Geography', topic: 'Geography', focus: 'GCSE Geography', description: 'GCSE Geography' },
    ]
  },
  {
    yearGroup: 'Y12-13',
    statutory: 14,
    subjects: [
      { subject: 'English', topic: 'English Language', focus: 'A-Level Language', description: 'A-Level English Language' },
      { subject: 'English', topic: 'English Literature', focus: 'A-Level Literature', description: 'A-Level English Literature' },
      { subject: 'Maths', topic: 'Mathematics', focus: 'A-Level Maths', description: 'A-Level Mathematics' },
      { subject: 'Biology', topic: 'Biological Molecules', focus: 'A-Level Biology', description: 'A-Level Biology' },
      { subject: 'Biology', topic: 'Cells', focus: 'A-Level Biology', description: 'A-Level Biology' },
      { subject: 'Chemistry', topic: 'Physical Chemistry', focus: 'A-Level Chemistry', description: 'A-Level Chemistry' },
      { subject: 'Chemistry', topic: 'Inorganic Chemistry', focus: 'A-Level Chemistry', description: 'A-Level Chemistry' },
      { subject: 'Physics', topic: 'Mechanics', focus: 'A-Level Physics', description: 'A-Level Physics' },
      { subject: 'Physics', topic: 'Electricity', focus: 'A-Level Physics', description: 'A-Level Physics' },
      { subject: 'History', topic: 'History', focus: 'A-Level History', description: 'A-Level History' },
      { subject: 'Geography', topic: 'Geography', focus: 'A-Level Geography', description: 'A-Level Geography' },
      { subject: 'French', topic: 'French', focus: 'A-Level Modern Languages', description: 'A-Level French' },
      { subject: 'Spanish', topic: 'Spanish', focus: 'A-Level Modern Languages', description: 'A-Level Spanish' },
      { subject: 'German', topic: 'German', focus: 'A-Level Modern Languages', description: 'A-Level German' },
      { subject: 'Art & Design', topic: 'Art', focus: 'A-Level Art', description: 'A-Level Art & Design' },
      { subject: 'Computing', topic: 'Computing', focus: 'A-Level CS', description: 'A-Level Computer Science' },
      { subject: 'PE', topic: 'PE', focus: 'A-Level PE', description: 'A-Level PE' },
    ]
  },
  {
    yearGroup: 'Extracurricular',
    statutory: 0,
    subjects: [
      { subject: 'Public Speaking', topic: 'Debating', focus: 'Debates, Presentations, Confidence', description: 'Public speaking and debating' },
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
  { id: 'Extracurricular' as ProfileTemplate, label: 'Extracurricular', ageRange: 'All Ages' },
];
