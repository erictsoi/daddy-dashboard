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
  { id: "amara", name: "Amara", year: "Year 1", age: "5-6", color: "#FF6B6B", tint: "#FFF0F0", emoji: "🦋", interests: ["Animals", "Drawing", "Singing", "Nature"] },
  { id: "marcus", name: "Marcus", year: "Year 3", age: "7-8", color: "#4CAF8A", tint: "#EDFAF4", emoji: "🦖", interests: ["Dinosaurs", "Football", "Building", "Comics"] },
  { id: "sophia", name: "Sophia", year: "Year 5", age: "9-10", color: "#9B6DD6", tint: "#F3EEFF", emoji: "🎨", interests: ["Art", "Dance", "Music", "Sports"] },
  { id: "kai", name: "Kai", year: "Year 7", age: "11-12", color: "#F5A623", tint: "#FFF8EC", emoji: "🛹", interests: ["Gaming", "Skateboarding", "History", "Film"] },
  { id: "adrian", name: "Adrian", year: "Year 9", age: "13-14", color: "#2B8ED4", tint: "#EAF4FC", emoji: "🏀", interests: ["Design", "Maths", "Science", "Basketball"] },
  { id: "rohan", name: "Rohan", year: "Year 11", age: "15-16", color: "#E8507A", tint: "#FFF0F5", emoji: "📸", interests: ["Coding", "Photography", "Film", "Economics"] },
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
          {
            id: `sub-${profile.id}-maths`,
            name: "Maths",
            category: "Maths",
            color: colorName,
            topics: [
              {
                id: `topic-${profile.id}-1`,
                name: "Core Topics",
                lessons: [
                  { id: `les-${profile.id}-1`, title: "Introduction", videoUrl: "", completed: false, outcomes: [] },
                  { id: `les-${profile.id}-2`, title: "Practice Problems", videoUrl: "", completed: false, outcomes: [] },
                ]
              }
            ]
          },
          {
            id: `sub-${profile.id}-english`,
            name: "English",
            category: "English",
            color: colorName,
            topics: [
              {
                id: `topic-${profile.id}-2`,
                name: "Reading & Writing",
                lessons: [
                  { id: `les-${profile.id}-3`, title: "Comprehension", videoUrl: "", completed: false, outcomes: [] },
                ]
              }
            ]
          },
          {
            id: `sub-${profile.id}-science`,
            name: "Science",
            category: "Science",
            color: colorName,
            topics: [
              {
                id: `topic-${profile.id}-3`,
                name: "Science Topics",
                lessons: [
                  { id: `les-${profile.id}-4`, title: " Experiments", videoUrl: "", completed: false, outcomes: [] },
                ]
              }
            ]
          }
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
