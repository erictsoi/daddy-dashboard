/**
 * demoProfiles.ts
 *
 * Display-only profiles used on LandingView / ReturningView for
 * users who are not signed in, or who have no real children yet.
 *
 * Rules:
 *  - IDs are prefixed with "demo-" so they can NEVER match a real Firebase child ID
 *  - googleEmail is intentionally absent — demo profiles must never trigger
 *    a fetchChildByEmail lookup
 *  - This file must NOT be imported by AdminDash, KidDash, or any data-writing code
 */

export interface DemoProfile {
  id: string;
  name: string;
  year: string;
  age: string;
  color: string;
  tint: string;
  emoji: string;
  image: string;
  interests: string[];
  isAdmin?: boolean;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'demo-amara',
    name: 'Amara',
    year: 'Year 1',
    age: '5–6',
    color: '#FF6B6B',
    tint: '#FFF0F0',
    emoji: '🎤',
    image: '/profile-pics/amara.jpg',
    interests: ['Animals', 'Drawing', 'Singing', 'Nature'],
  },
  {
    id: 'demo-marcus',
    name: 'Marcus',
    year: 'Year 3',
    age: '7–8',
    color: '#4CAF8A',
    tint: '#EDFAF4',
    emoji: '🦖',
    image: '/profile-pics/marcus.jpg',
    interests: ['Dinosaurs', 'Football', 'Building', 'Comics'],
  },
  {
    id: 'demo-sophia',
    name: 'Sophia',
    year: 'Year 5',
    age: '9–10',
    color: '#9B6DD6',
    tint: '#F3EEFF',
    emoji: '🎨',
    image: '/profile-pics/sophia.jpg',
    interests: ['Art', 'Dance', 'Music', 'Sports'],
  },
  {
    id: 'demo-kai',
    name: 'Kai',
    year: 'Year 7',
    age: '11–12',
    color: '#F5A623',
    tint: '#FFF8EC',
    emoji: '🛹',
    image: '/profile-pics/kai.jpg',
    interests: ['Gaming', 'Skateboarding', 'History', 'Film'],
  },
  {
    id: 'demo-adrian',
    name: 'Adrian',
    year: 'Year 9',
    age: '13–14',
    color: '#2B8ED4',
    tint: '#EAF4FC',
    emoji: '🏀',
    image: '/profile-pics/adrian.jpg',
    interests: ['Design', 'Maths', 'Science', 'Basketball'],
  },
  {
    id: 'demo-rohan',
    name: 'Rohan',
    year: 'Year 11',
    age: '15–16',
    color: '#E8507A',
    tint: '#FFF0F5',
    emoji: '📸',
    image: '/profile-pics/rohan.jpg',
    interests: ['Coding', 'Photography', 'Film', 'Economics'],
  },
];

/** The admin card — always prepended to the profile picker */
export const ADMIN_DEMO_PROFILE: DemoProfile = {
  id: 'admin',
  name: 'Daddy',
  year: 'Admin',
  age: '',
  color: '#1A1A2E',
  tint: '#E8E8E8',
  emoji: '👨',
  image: '/profile-pics/Admin.jpg',
  interests: ['Dashboard', 'Settings'],
  isAdmin: true,
};

/** Backward compatibility alias */
export const DUMMY_PROFILES = DEMO_PROFILES;
