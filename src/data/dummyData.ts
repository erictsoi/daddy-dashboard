import { ChildProfile } from '../types';
import { DEMO_DISPLAY_PROFILES } from './demoProfiles';

export { DUMMY_PROFILES } from './demoProfiles';

const THEME_COLOR_NAMES: Record<string, string> = {
  demo_amara: 'rose',
  demo_marcus: 'green',
  demo_sophia: 'purple',
  demo_kai: 'amber',
  demo_adrian: 'blue',
  demo_rohan: 'rose',
};

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

const createDummyChild = (profile: typeof DEMO_DISPLAY_PROFILES[0]): ChildProfile => {
  const colorName = THEME_COLOR_NAMES[profile.id] || 'blue';
  const yearNum = parseInt(profile.year.replace("Year ", ""));
  const isSecondary = yearNum >= 7;

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
              completed: idx < 2, // First two lessons completed
              outcomes: []
            }]
          }]
        }))
      }
    ]
  };
};

export const DUMMY_CHILDREN: ChildProfile[] = DEMO_DISPLAY_PROFILES.map(createDummyChild);

export const getDummyChild = (childId: string): ChildProfile | undefined => {
  return DUMMY_CHILDREN.find(c => c.id === childId);
};
