import { ChildProfile, Subject, Lesson } from './types';

// Helper to create lessons quickly
const createLesson = (title: string, duration: number, outcomes: string[], videoId: string = "dQw4w9WgXcQ"): Lesson => ({
  id: Math.random().toString(36).substr(2, 9),
  title,
  durationMinutes: duration,
  completed: false,
  videoUrl: `https://www.youtube.com/embed/${videoId}`,
  outcomes
});

export const CREATIVE_PROMPTS = [
  "Write a story about a talking animal who can't sleep",
  "Draw your dream house with 5 impossible features",
  "Create a 3-minute dance routine",
  "Write a letter to yourself in 10 years",
  "Design a new board game",
  "Record yourself reading a poem dramatically",
  "Build something from recycling materials",
  "Create a comic strip about your morning"
];

// Initial Data based on user prompt
export const INITIAL_DATA: ChildProfile[] = [
  {
    id: 'kid1',
    name: '',
    dob: '',
    avatar: '🧑‍🚀',
    themeColor: 'indigo',
    yearGroups: [
      {
        id: 'kid1-y9',
        name: 'Year 9',
        subjects: [
          {
            id: 'k1-y9-eng',
            name: 'English: Writing Narratives',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            lessons: []
          },
          {
            id: 'k1-y9-math',
            name: 'Maths: Number Operations',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            lessons: []
          }
        ]
      },
      {
        id: 'kid1-y10',
        name: 'Year 10',
        subjects: [
           {
            id: 'k1-y10-sci',
            name: 'Science: Biology',
            category: 'Science',
            color: 'bg-green-100 text-green-800',
            lessons: []
          }
        ]
      }
    ]
  },
  {
    id: 'kid2',
    name: '',
    dob: '',
    avatar: '👩‍🎨',
    themeColor: 'rose',
    yearGroups: [
      {
        id: 'kid2-y5',
        name: 'Year 5',
        subjects: [
          {
            id: 'k2-y5-math',
            name: 'Maths: Shape & Measure',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            lessons: []
          },
          {
            id: 'k2-y5-sci',
            name: 'Science: Living Things',
            category: 'Science',
            color: 'bg-emerald-100 text-emerald-800',
            lessons: []
          }
        ]
      },
      {
        id: 'kid2-y6',
        name: 'Year 6',
        subjects: [
          {
            id: 'k2-y6-eng',
            name: 'English: Persuasive Writing',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            lessons: []
          }
        ]
      }
    ]
  },
  {
    id: 'kid3',
    name: '',
    dob: '',
    avatar: '🎓',
    themeColor: 'emerald',
    yearGroups: [
      {
        id: 'kid3-y1',
        name: 'Year 1',
        subjects: [
          {
            id: 'k3-y1-math',
            name: 'Maths: Numbers to 20',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            lessons: []
          },
          {
            id: 'k3-y1-eng',
            name: 'English: Phonics',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            lessons: []
          }
        ]
      }
    ]
  }
];

// Mock AI Suggestions
export const SUGGESTED_TOPICS: Record<string, any[]> = {
  'Year 5': [
    { name: 'English: Creative Writing', cat: 'English', lessons: ['Character Descriptions', 'Setting the Scene', 'Plot Twists'] },
    { name: 'Maths: Fractions', cat: 'Maths', lessons: ['Equivalent Fractions', 'Improper Fractions', 'Adding Fractions'] },
    { name: 'Humanities: Vikings', cat: 'Humanities', lessons: ['Who were the Vikings?', 'Longships', 'Viking Settlements'] }
  ],
  'Year 6': [
    { name: 'Science: Electricity', cat: 'Science', lessons: ['Circuits', 'Conductors & Insulators', 'Voltage'] },
    { name: 'Maths: Ratio', cat: 'Maths', lessons: ['Introduction to Ratio', 'Scale Drawings', 'Proportion'] }
  ],
  'Year 9': [
    { name: 'History: WWI', cat: 'Humanities', lessons: ['Causes of WWI', 'Trench Warfare', 'Treaty of Versailles'] },
    { name: 'Computing: Python', cat: 'Creative', lessons: ['Variables', 'Loops', 'Functions'] }
  ],
  'Year 10': [
    { name: 'Physics: Forces', cat: 'Science', lessons: ['Newton Laws', 'Velocity Time Graphs', 'Gravity'] },
    { name: 'English: Macbeth', cat: 'English', lessons: ['Context', 'The Witches', 'Lady Macbeth'] }
  ]
};