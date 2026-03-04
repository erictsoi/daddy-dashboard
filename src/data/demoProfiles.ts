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
    id: 'demo-sophia',
    name: 'Sophia',
    year: 'Year 5 and 6',
    age: '9–11',
    color: '#9B6DD6',
    tint: '#F3EEFF',
    emoji: '🎨',
    image: '/profile-pics/sophia.jpg',
    interests: ['Art', 'Dance', 'Music', 'Sports'],
  },
  {
    id: 'demo-adrian',
    name: 'Adrian',
    year: 'Year 7/8 and 9',
    age: '11–14',
    color: '#2B8ED4',
    tint: '#EAF4FC',
    emoji: '🏀',
    image: '/profile-pics/adrian.jpg',
    interests: ['Design', 'Maths', 'Science', 'Basketball'],
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
