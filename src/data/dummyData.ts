import { ChildProfile } from '../types';

const THEME_COLOR_NAMES: Record<string, string> = {
  demo_amara: 'rose',
  demo_marcus: 'green',
  demo_sophia: 'purple',
  demo_kai: 'amber',
  demo_adrian: 'blue',
  demo_rohan: 'rose',
};

export const DUMMY_PROFILES = [
  { id: "demo_amara", name: "Amara", year: "Year 1", age: "5-6", color: "#FF6B6B", tint: "#FFF0F0", emoji: "🎤", image: "/profile-pics/amara.jpg", interests: ["Animals", "Drawing", "Singing", "Nature"] },
  { id: "demo_marcus", name: "Marcus", year: "Year 3", age: "7-8", color: "#4CAF8A", tint: "#EDFAF4", emoji: "🦖", image: "/profile-pics/marcus.jpg", interests: ["Dinosaurs", "Football", "Building", "Comics"] },
  { id: "demo_sophia", name: "Sophia", year: "Year 5", age: "9-10", color: "#9B6DD6", tint: "#F3EEFF", emoji: "🎨", image: "/profile-pics/sophia.jpg", interests: ["Art", "Dance", "Music", "Sports"] },
  { id: "demo_kai", name: "Kai", year: "Year 7", age: "11-12", color: "#F5A623", tint: "#FFF8EC", emoji: "🛹", image: "/profile-pics/kai.jpg", interests: ["Gaming", "Skateboarding", "History", "Film"] },
  { id: "demo_adrian", name: "Adrian", year: "Year 9", age: "13-14", color: "#2B8ED4", tint: "#EAF4FC", emoji: "🏀", image: "/profile-pics/adrian.jpg", interests: ["Design", "Maths", "Science", "Basketball"] },
  { id: "demo_rohan", name: "Rohan", year: "Year 11", age: "15-16", color: "#E8507A", tint: "#FFF0F5", emoji: "📸", image: "/profile-pics/rohan.jpg", interests: ["Coding", "Photography", "Film", "Economics"] },
];

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

const createDummyChild = (profile: typeof DUMMY_PROFILES[0]): ChildProfile => {
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

export const DUMMY_CHILDREN: ChildProfile[] = DUMMY_PROFILES.map(createDummyChild);

export const getDummyChild = (childId: string): ChildProfile | undefined => {
  return DUMMY_CHILDREN.find(c => c.id === childId);
};
