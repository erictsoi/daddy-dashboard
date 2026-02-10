import { ChildProfile } from './types';

// Structure: Child → YearGroup → Subject → Topic → Lessons
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
            name: 'English',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            topics: [
              {
                id: 'k1-y9-eng-writing',
                name: 'Writing Narratives',
                lessons: []
              }
            ]
          },
          {
            id: 'k1-y9-math',
            name: 'Maths',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            topics: [
              {
                id: 'k1-y9-math-ops',
                name: 'Number Operations',
                lessons: []
              }
            ]
          }
        ]
      },
      {
        id: 'kid1-y10',
        name: 'Year 10',
        subjects: [
          {
            id: 'k1-y10-sci',
            name: 'Science',
            category: 'Science',
            color: 'bg-green-100 text-green-800',
            topics: [
              {
                id: 'k1-y10-sci-bio',
                name: 'Biology',
                lessons: []
              }
            ]
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
            name: 'Maths',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            topics: [
              {
                id: 'k2-y5-math-shape',
                name: 'Shape & Measure',
                lessons: []
              }
            ]
          },
          {
            id: 'k2-y5-sci',
            name: 'Science',
            category: 'Science',
            color: 'bg-emerald-100 text-emerald-800',
            topics: [
              {
                id: 'k2-y5-sci-living',
                name: 'Living Things',
                lessons: []
              }
            ]
          }
        ]
      },
      {
        id: 'kid2-y6',
        name: 'Year 6',
        subjects: [
          {
            id: 'k2-y6-eng',
            name: 'English',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            topics: [
              {
                id: 'k2-y6-eng-pers',
                name: 'Persuasive Writing',
                lessons: []
              }
            ]
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
            name: 'Maths',
            category: 'Maths',
            color: 'bg-blue-100 text-blue-800',
            topics: [
              {
                id: 'k3-y1-math-20',
                name: 'Numbers to 20',
                lessons: []
              }
            ]
          },
          {
            id: 'k3-y1-eng',
            name: 'English',
            category: 'English',
            color: 'bg-amber-100 text-amber-800',
            topics: [
              {
                id: 'k3-y1-eng-phon',
                name: 'Phonics',
                lessons: []
              }
            ]
          }
        ]
      }
    ]
  }
];
