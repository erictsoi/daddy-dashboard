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
    id: 'adrian',
    name: 'Adrian',
    dob: '13/10/2012',
    avatar: '🧑‍🚀',
    themeColor: 'indigo',
    yearGroups: [
      {
        id: 'adrian-y9',
        name: 'Year 9',
        subjects: [
          {
            id: 'a9-eng',
            name: 'English: Writing Narratives',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            lessons: [
              createLesson("Story Arcs & Structure", 45, ["Understand the 5 key points of a narrative arc", "Analyze a short story structure"]),
              createLesson("Character Development", 45, ["Create character profiles", "Show don't tell techniques"]),
              createLesson("Setting the Scene", 40, ["Using sensory imagery", "Atmosphere creation"]),
            ]
          },
          {
            id: 'a9-math',
            name: 'Maths: Number Operations',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            lessons: [
              createLesson("Indices & Roots", 50, ["Laws of indices", "Square and cube roots"]),
              createLesson("Standard Form", 45, ["Converting large numbers", "Calculations in standard form"]),
            ]
          }
        ]
      },
      {
        id: 'adrian-y10',
        name: 'Year 10',
        subjects: [
           {
            id: 'a10-sci',
            name: 'Science: Biology',
            category: 'Science',
            color: 'bg-green-100 text-green-800',
            lessons: [
              createLesson("Cell Structure", 60, ["Plant vs Animal cells", "Functions of organelles"]),
              createLesson("Cell Division", 60, ["Mitosis stages", "Meiosis introduction"]),
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sophia',
    name: 'Sophia',
    dob: '29/10/2016',
    avatar: '👩‍🎨',
    themeColor: 'rose',
    yearGroups: [
      {
        id: 'sophia-y5',
        name: 'Year 5',
        subjects: [
          {
            id: 's5-math',
            name: 'Maths: Shape & Measure',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            lessons: [
              createLesson("Perimeter & Area", 30, ["Calculate perimeter of rectangles", "Calculate area of compound shapes"]),
              createLesson("Angles", 30, ["Measuring angles", "Types of angles"]),
            ]
          },
          {
            id: 's5-sci',
            name: 'Science: Living Things',
            category: 'Science',
            color: 'bg-emerald-100 text-emerald-800',
            lessons: [
              createLesson("Life Cycles", 35, ["Mammals vs Amphibians", "Metamorphosis"]),
              createLesson("Plant Reproduction", 35, ["Pollination", "Seed dispersal"]),
            ]
          }
        ]
      },
      {
        id: 'sophia-y6',
        name: 'Year 6',
        subjects: [
          {
            id: 's6-eng',
            name: 'English: Persuasive Writing',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            lessons: [
              createLesson("Rhetorical Devices", 40, ["Rule of three", "Alliteration and Facts"]),
              createLesson("Writing a Speech", 45, ["Structure of a speech", "Opening hooks"]),
            ]
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