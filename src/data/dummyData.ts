import { ChildProfile } from '../types';
import { DEMO_PROFILES } from './demoProfiles';
import { getSubjectCardsForYear, SubjectCard } from '../lib/subjectCards';

export { DUMMY_PROFILES } from './demoProfiles';

const THEME_COLOR_NAMES: Record<string, string> = {
  'demo-amara': 'rose',
  'demo-marcus': 'green',
  'demo-sophia': 'purple',
  'demo-kai': 'amber',
  'demo-adrian': 'blue',
  'demo-rohan': 'rose',
};

const YEAR_GROUP_MAP: Record<string, string> = {
  'Year 5': 'Y5-6',
  'Year 6': 'Y5-6',
  'Year 7': 'Y7-9',
  'Year 8': 'Y7-9',
  'Year 9': 'Y7-9',
};

const getYearGroupKey = (year: string): string | undefined => {
  return YEAR_GROUP_MAP[year];
};

const createSubjectFromCard = (card: SubjectCard, colorName: string, childId: string, subjectIdx: number) => {
  return {
    id: `sub-${childId}-${card.subject.toLowerCase().replace(/\s+/g, '-')}`,
    name: card.subject,
    category: card.subject,
    color: colorName,
    topics: card.playlists.map((playlist, playlistIdx) => ({
      id: `topic-${childId}-${card.subject.toLowerCase().replace(/\s+/g, '-')}-${subjectIdx}-${playlistIdx}`,
      name: playlist.title,
      lessons: playlist.videos.slice(0, 5).map((video, videoIdx) => ({
        id: `les-${childId}-${card.subject.toLowerCase().replace(/\s+/g, '-')}-${subjectIdx}-${playlistIdx}-${videoIdx}`,
        title: video.title,
        videoUrl: video.url,
        completed: videoIdx < 1,
        outcomes: []
      }))
    }))
  };
};

const createDummyChild = (profile: typeof DEMO_PROFILES[0]): ChildProfile => {
  const colorName = THEME_COLOR_NAMES[profile.id] || 'blue';
  const yearGroupKey = getYearGroupKey(profile.year);
  const subjectCards = yearGroupKey ? getSubjectCardsForYear(yearGroupKey) : [];
  
  const hasRealData = subjectCards.length > 0;
  
  if (hasRealData) {
    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.emoji,
      themeColor: colorName,
      dob: "",
      googleEmail: `${profile.id}@demo.example`,
      yearGroups: [
        {
          id: `yg-${profile.id}-1`,
          name: profile.year,
          subjects: subjectCards.map((card, idx) => createSubjectFromCard(card, colorName, profile.id, idx))
        }
      ]
    };
  }

  const isSecondary = profile.year.includes('7') || profile.year.includes('8') || profile.year.includes('9') || profile.year.includes('10') || profile.year.includes('11') || profile.year.includes('12');
  
  const GET_SUBJECT_TEMPLATES = (isSecondary: boolean) => [
    { name: "Maths", category: "Maths", topic: isSecondary ? "Algebra II" : "Fractions", lesson: isSecondary ? "Quadratic Equations" : "Introduction to Fractions" },
    { name: isSecondary ? "English Lit" : "English", category: "English", topic: isSecondary ? "Shakespeare" : "Creative Writing", lesson: isSecondary ? "Macbeth Analysis" : "Story Writing" },
    { name: isSecondary ? "Physics" : "Science", category: "Science", topic: isSecondary ? "Mechanics" : "Ecosystems", lesson: isSecondary ? "Newton's Laws" : "What is an Ecosystem?" },
    { name: "Art", category: "Art", topic: isSecondary ? "Digital Art" : "Watercolour", lesson: isSecondary ? "Layer Masking" : "Watercolour Basics" },
    { name: "Music", category: "Music", topic: isSecondary ? "Music Theory" : "Rhythm & Beat", lesson: isSecondary ? "Circle of Fifths" : "Rhythm Basics" },
    { name: "PE", category: "PE", topic: isSecondary ? "Basketball" : "Gymnastics", lesson: isSecondary ? "Three-point Drills" : "Gymnastics Moves" },
    { name: "History", category: "History", topic: isSecondary ? "World Wars" : "Ancient Egypt", lesson: isSecondary ? "Cold War Origins" : "Ancient Egypt Intro" },
    { name: "Geography", category: "Geography", topic: isSecondary ? "Climate Change" : "Weather Systems", lesson: isSecondary ? "Carbon Cycle" : "Weather Basics" },
    { name: isSecondary ? "Computer Science" : "Technology", category: isSecondary ? "Science" : "Design", topic: isSecondary ? "Python" : "Intro to Coding", lesson: isSecondary ? "Recursion" : "Coding Basics" },
    { name: "Languages", category: "Languages", topic: isSecondary ? "Spanish" : "French", lesson: isSecondary ? "Verb Conjugation" : "French Greetings" },
    { name: "PSHE", category: "PSHE", topic: "Wellbeing", lesson: "Mental Health Awareness" },
  ];

  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.emoji,
    themeColor: colorName,
    dob: "",
    googleEmail: `${profile.id}@demo.example`,
    yearGroups: [
      {
        id: `yg-${profile.id}-1`,
        name: profile.year,
        subjects: GET_SUBJECT_TEMPLATES(isSecondary).map((template, idx) => ({
          id: `sub-${profile.id}-${template.name.toLowerCase()}`,
          name: template.name,
          category: template.category,
          color: colorName,
          topics: [{
            id: `topic-${profile.id}-${idx}`,
            name: template.topic,
            lessons: [{
              id: `les-${profile.id}-${idx}`,
              title: template.lesson,
              videoUrl: "",
              completed: idx < 2,
              outcomes: []
            }]
          }]
        }))
      }
    ]
  };
};

export const DUMMY_CHILDREN: ChildProfile[] = DEMO_PROFILES.map(createDummyChild);

export const getDummyChild = (childId: string): ChildProfile | undefined => {
  return DUMMY_CHILDREN.find(c => c.id === childId);
};
