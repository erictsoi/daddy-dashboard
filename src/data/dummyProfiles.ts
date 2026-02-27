import { ChildProfile } from '../types';
import { getSubjectHexColor as getColor } from '../utils/subjects';

export const DUMMY_PROFILES: ChildProfile[] = [
  {
    id: "amara",
    name: "Amara",
    dob: "",
    avatar: "🦋",
    themeColor: "rose",
    yearGroups: [
      {
        id: "amara-y1",
        name: "Year 1",
        subjects: [
          { id: "amara-maths", name: "Maths", category: "Maths", color: getColor("Maths"), topics: [{ id: "amara-maths-1", name: "Numbers", lessons: [] }] },
          { id: "amara-english", name: "English", category: "English", color: getColor("English"), topics: [{ id: "amara-english-1", name: "Phonics", lessons: [] }] },
          { id: "amara-science", name: "Science", category: "Science", color: getColor("Science"), topics: [{ id: "amara-science-1", name: "Animals", lessons: [] }] },
        ]
      }
    ]
  },
  {
    id: "marcus",
    name: "Marcus",
    dob: "",
    avatar: "🦖",
    themeColor: "emerald",
    yearGroups: [
      {
        id: "marcus-y3",
        name: "Year 3",
        subjects: [
          { id: "marcus-maths", name: "Maths", category: "Maths", color: getColor("Maths"), topics: [{ id: "marcus-maths-1", name: "Multiplication", lessons: [] }] },
          { id: "marcus-english", name: "English", category: "English", color: getColor("English"), topics: [{ id: "marcus-english-1", name: "Reading", lessons: [] }] },
          { id: "marcus-science", name: "Science", category: "Science", color: getColor("Science"), topics: [{ id: "marcus-science-1", name: "Dinosaurs", lessons: [] }] },
        ]
      }
    ]
  },
  {
    id: "sophia",
    name: "Sophia",
    dob: "",
    avatar: "🎨",
    themeColor: "purple",
    yearGroups: [
      {
        id: "sophia-y5",
        name: "Year 5",
        subjects: [
          { id: "sophia-maths", name: "Maths", category: "Maths", color: getColor("Maths"), topics: [{ id: "sophia-maths-1", name: "Fractions", lessons: [] }] },
          { id: "sophia-english", name: "English", category: "English", color: getColor("English"), topics: [{ id: "sophia-english-1", name: "Creative Writing", lessons: [] }] },
          { id: "sophia-science", name: "Science", category: "Science", color: getColor("Science"), topics: [{ id: "sophia-science-1", name: "Ecosystems", lessons: [] }] },
          { id: "sophia-art", name: "Art", category: "Art", color: getColor("Art"), topics: [{ id: "sophia-art-1", name: "Watercolour", lessons: [] }] },
          { id: "sophia-music", name: "Music", category: "Music", color: getColor("Music"), topics: [{ id: "sophia-music-1", name: "Rhythm & Beat", lessons: [] }] },
          { id: "sophia-pe", name: "PE", category: "PE", color: getColor("PE"), topics: [{ id: "sophia-pe-1", name: "Gymnastics", lessons: [] }] },
        ]
      }
    ]
  },
  {
    id: "kai",
    name: "Kai",
    dob: "",
    avatar: "🛹",
    themeColor: "orange",
    yearGroups: [
      {
        id: "kai-y7",
        name: "Year 7",
        subjects: [
          { id: "kai-maths", name: "Maths", category: "Maths", color: getColor("Maths"), topics: [{ id: "kai-maths-1", name: "Algebra", lessons: [] }] },
          { id: "kai-english", name: "English", category: "English", color: getColor("English"), topics: [{ id: "kai-english-1", name: "Literature", lessons: [] }] },
          { id: "kai-science", name: "Science", category: "Science", color: getColor("Science"), topics: [{ id: "kai-science-1", name: "Physics", lessons: [] }] },
        ]
      }
    ]
  },
  {
    id: "adrian",
    name: "Adrian",
    dob: "",
    avatar: "🏀",
    themeColor: "blue",
    yearGroups: [
      {
        id: "adrian-y9",
        name: "Year 9",
        subjects: [
          { id: "adrian-maths", name: "Maths", category: "Maths", color: getColor("Maths"), topics: [{ id: "adrian-maths-1", name: "Algebra II", lessons: [] }] },
          { id: "adrian-english", name: "English", category: "English", color: getColor("English"), topics: [{ id: "adrian-english-1", name: "Essay Writing", lessons: [] }] },
          { id: "adrian-science", name: "Science", category: "Science", color: getColor("Science"), topics: [{ id: "adrian-science-1", name: "Chemical Reactions", lessons: [] }] },
          { id: "adrian-design", name: "Design", category: "Design", color: getColor("Design"), topics: [{ id: "adrian-design-1", name: "Graphic Design", lessons: [] }] },
        ]
      }
    ]
  },
  {
    id: "rohan",
    name: "Rohan",
    dob: "",
    avatar: "📸",
    themeColor: "rose",
    yearGroups: [
      {
        id: "rohan-y11",
        name: "Year 11",
        subjects: [
          { id: "rohan-maths", name: "Maths", category: "Maths", color: getColor("Maths"), topics: [{ id: "rohan-maths-1", name: "Calculus", lessons: [] }] },
          { id: "rohan-english", name: "English", category: "English", color: getColor("English"), topics: [{ id: "rohan-english-1", name: "Literature", lessons: [] }] },
          { id: "rohan-economics", name: "Economics", category: "Economics", color: getColor("Economics"), topics: [{ id: "rohan-economics-1", name: "Microeconomics", lessons: [] }] },
        ]
      }
    ]
  },
];
