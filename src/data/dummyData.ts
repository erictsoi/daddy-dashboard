import { ChildProfile } from '../../types';

const THEME_COLORS: Record<string, string> = {
  amara: '#FF6B6B',
  marcus: '#4CAF8A',
  sophia: '#9B6DD6',
  kai: '#F5A623',
  adrian: '#2B8ED4',
  rohan: '#E8507A',
};

const THEME_COLOR_NAMES: Record<string, string> = {
  amara: 'rose',
  marcus: 'green',
  sophia: 'purple',
  kai: 'amber',
  adrian: 'blue',
  rohan: 'rose',
};

export const DUMMY_PROFILES = [
  { id: "amara", name: "Amara", year: "Year 1", age: "5-6", color: "#FF6B6B", tint: "#FFF0F0", emoji: "🎤", image: "/profile-pics/amara.jpg", interests: ["Animals", "Drawing", "Singing", "Nature"] },
  { id: "marcus", name: "Marcus", year: "Year 3", age: "7-8", color: "#4CAF8A", tint: "#EDFAF4", emoji: "🦖", image: "/profile-pics/marcus.jpg", interests: ["Dinosaurs", "Football", "Building", "Comics"] },
  { id: "sophia", name: "Sophia", year: "Year 5", age: "9-10", color: "#9B6DD6", tint: "#F3EEFF", emoji: "🎨", image: "/profile-pics/sophia.jpg", interests: ["Art", "Dance", "Music", "Sports"] },
  { id: "kai", name: "Kai", year: "Year 7", age: "11-12", color: "#F5A623", tint: "#FFF8EC", emoji: "🛹", image: "/profile-pics/kai.jpg", interests: ["Gaming", "Skateboarding", "History", "Film"] },
  { id: "adrian", name: "Adrian", year: "Year 9", age: "13-14", color: "#2B8ED4", tint: "#EAF4FC", emoji: "🏀", image: "/profile-pics/adrian.jpg", interests: ["Design", "Maths", "Science", "Basketball"] },
  { id: "rohan", name: "Rohan", year: "Year 11", age: "15-16", color: "#E8507A", tint: "#FFF0F5", emoji: "📸", image: "/profile-pics/rohan.jpg", interests: ["Coding", "Photography", "Film", "Economics"] },
];

const createDummyChild = (profile: typeof DUMMY_PROFILES[0]): ChildProfile => {
  const colorName = THEME_COLOR_NAMES[profile.id] || 'blue';
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.emoji,
    themeColor: colorName,
    dob: "",
    googleEmail: `${profile.id}@gmail.com`,
    yearGroups: [
      {
        id: `yg-${profile.id}-1`,
        name: profile.year,
        subjects: [
          { id: `sub-${profile.id}-maths`, name: "Maths", category: "Maths", color: colorName,
            topics: [{ id: `topic-${profile.id}-1`, name: "Fractions", lessons: [{ id: `les-${profile.id}-1`, title: "Introduction to Fractions", videoUrl: "", completed: true, outcomes: [] }] }] },
          { id: `sub-${profile.id}-english`, name: "English", category: "English", color: colorName,
            topics: [{ id: `topic-${profile.id}-2`, name: "Creative Writing", lessons: [{ id: `les-${profile.id}-2`, title: "Story Writing", videoUrl: "", completed: true, outcomes: [] }] }] },
          { id: `sub-${profile.id}-science`, name: "Science", category: "Science", color: colorName,
            topics: [{ id: `topic-${profile.id}-3`, name: "Ecosystems", lessons: [{ id: `les-${profile.id}-3`, title: "What is an Ecosystem?", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-art`, name: "Art", category: "Art", color: colorName,
            topics: [{ id: `topic-${profile.id}-4`, name: "Watercolour", lessons: [{ id: `les-${profile.id}-4`, title: "Watercolour Basics", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-music`, name: "Music", category: "Music", color: colorName,
            topics: [{ id: `topic-${profile.id}-5`, name: "Rhythm & Beat", lessons: [{ id: `les-${profile.id}-5`, title: "Rhythm Basics", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-pe`, name: "PE", category: "PE", color: colorName,
            topics: [{ id: `topic-${profile.id}-6`, name: "Gymnastics", lessons: [{ id: `les-${profile.id}-6`, title: "Gymnastics Moves", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-history`, name: "History", category: "History", color: colorName,
            topics: [{ id: `topic-${profile.id}-7`, name: "Ancient Egypt", lessons: [{ id: `les-${profile.id}-7`, title: "Ancient Egypt Intro", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-geography`, name: "Geography", category: "Geography", color: colorName,
            topics: [{ id: `topic-${profile.id}-8`, name: "Weather Systems", lessons: [{ id: `les-${profile.id}-8`, title: "Weather Basics", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-drama`, name: "Drama", category: "Drama", color: colorName,
            topics: [{ id: `topic-${profile.id}-9`, name: "Improvisation", lessons: [{ id: `les-${profile.id}-9`, title: "Improv Games", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-tech`, name: "Technology", category: "Design", color: colorName,
            topics: [{ id: `topic-${profile.id}-10`, name: "Intro to Coding", lessons: [{ id: `les-${profile.id}-10`, title: "Coding Basics", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-lang`, name: "Languages", category: "Languages", color: colorName,
            topics: [{ id: `topic-${profile.id}-11`, name: "French Basics", lessons: [{ id: `les-${profile.id}-11`, title: "French Greetings", videoUrl: "", completed: false, outcomes: [] }] }] },
          { id: `sub-${profile.id}-pshe`, name: "PSHE", category: "PSHE", color: colorName,
            topics: [{ id: `topic-${profile.id}-12`, name: "Wellbeing", lessons: [{ id: `les-${profile.id}-12`, title: "Wellbeing Basics", videoUrl: "", completed: false, outcomes: [] }] }] },
        ]
      }
    ]
  };
};

export const DUMMY_CHILDREN: ChildProfile[] = DUMMY_PROFILES.map(createDummyChild);

export const getDummyChild = (childId: string): ChildProfile | undefined => {
  return DUMMY_CHILDREN.find(c => c.id === childId);
};

export const getDummyProfiles = () => DUMMY_PROFILES;
