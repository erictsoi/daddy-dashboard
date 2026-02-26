import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { ChildProfile, YearGroup, Subject, Topic, Lesson, ScheduleBlock, ParsedRow } from './types';
import { INITIAL_DATA } from './constants';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { auth as firebaseAuth, googleProvider, signInWithGoogle, logOut as firebaseLogOut } from './lib/firebase'
import { fetchChildren, fetchChildByEmail, fetchChildById, getLocalData, saveFullCurriculum, softDeleteLessonInFirebase, hardDeleteLessonFromFirebase, hardDeleteSubjectFromFirebase, hardDeleteTopicFromFirebase, migrateChildToTopicStructure, fetchUserSettings, saveUserSettings, UserSettings } from './lib/dataService';
import { getSubjectWeight, STEM_SUBJECTS, CORE_SUBJECTS } from './lib/scheduleUtils';
import { usePersistentTimer } from './lib/useTimer';
import { saveData, generateUuid, exportDataToFile } from './lib/helpers';
const CurriculumBuilder = lazy(() => import('./components/CurriculumBuilder').then(m => ({ default: m.CurriculumBuilder })));
const AdminDash = lazy(() => import('./views/AdminDash').then(m => ({ default: m.AdminDash })));
const KidDash = lazy(() => import('./views/KidDash').then(m => ({ default: m.KidDash })));
const LessonView = lazy(() => import('./views/LessonView').then(m => ({ default: m.LessonView })));
const ReturningView = lazy(() => import('./views/ReturningView').then(m => ({ default: m.ReturningView })));
const Marketplace = lazy(() => import('./views/Marketplace').then(m => ({ default: m.Marketplace })));
const TempGridView = lazy(() => import('./views/TempGridView').then(m => ({ default: m.TempGridView })));
import { LandingView } from './views/LandingView';

import { AdminAvatarEditModal } from './app/AdminAvatarEditModal';


const findChildById = (data: ChildProfile[], childId: string): ChildProfile | undefined => {
  return data.find(c => c.id === childId);
};

const findYearGroup = (child: ChildProfile | undefined, subjectId: string) => {
  if (!child) return undefined;
  return child.yearGroups.find(y => y.subjects.some(s => s.id === subjectId));
};

const findSubject = (yearGroup: YearGroup | undefined, subjectId: string) => {
  return yearGroup?.subjects.find(s => s.id === subjectId);
};

const findTopic = (subject: Subject | undefined, topicId: string) => {
  return subject?.topics.find(t => t.id === topicId);
};

const findLesson = (topic: Topic | undefined, lessonId: string) => {
  return topic?.lessons.find(l => l.id === lessonId);
};

// Import data from JSON file
const importDataFromFile = (file: File): Promise<ChildProfile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.children && Array.isArray(parsed.children)) {
          // Generate unique topic IDs to prevent cross-contamination
          const generateUuid = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };

          // Deduplicate at year group level and ensure unique topic IDs
          // Keep ALL lessons - don't deduplicate across topics (same video can be in multiple topics)
          const dedupedChildren = parsed.children.map((child: ChildProfile) => ({
            ...child,
            yearGroups: child.yearGroups.map((yg) => ({
              ...yg,
              subjects: yg.subjects.map((subject) => ({
                ...subject,
                topics: subject.topics
                  .filter((topic, index, self) =>
                    index === self.findIndex((t) => t.id === topic.id)
                  )
                  .map((topic) => ({
                    ...topic,
                    id: generateUuid() // Always generate new unique ID
                    // Keep all lessons - no deduplication
                  }))
              }))
            }))
          }));
          resolve(dedupedChildren);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Hidden file input ref for import
let importFileInputRef: HTMLInputElement | null = null;
import { ChildManagement } from './components/ChildManagement';
import { EditProfile } from './components/EditProfile';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth() || {};
  const [data, setData] = useState<ChildProfile[]>([]);

  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [allChildren, setAllChildren] = useState<{ id: string, name: string, avatar: string, themeColor: string, yearGroups?: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);

  // Admin profile state (loaded from Firestore)
  const [adminAvatar, setAdminAvatar] = useState('👨‍🏫');
  const [adminColor, setAdminColor] = useState('blue');
  const [adminName, setAdminName] = useState('');
  const [adminDob, setAdminDob] = useState('');
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [parentEmailInput, setParentEmailInput] = useState('');
  const [parentUid, setParentUid] = useState('');

  const [authDebug, setAuthDebug] = useState<string>('');

  // Scroll Restoration
  const scrollYRef = useRef(0);

  // Schedule State
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [isDayActive, setIsDayActive] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  // Load data on mount and when user changes
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }

    console.log('Auth loaded, user =', user?.uid || 'null');

    // Only skip if we've already loaded data for this user
    if (lastUserIdRef.current === user?.uid && data.length > 0) {
      console.log('Already loaded data for this user, skipping');
      return;
    }

    // Prevent parallel fetches from React Strict Mode double-rendering
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }

    lastUserIdRef.current = user?.uid || null;
    isFetchingRef.current = true;

    const loadData = async () => {
      setAuthDebug('loadData starting...');
      console.log('loadData: user =', user?.uid || 'null');
      console.log('loadData: user email =', user?.email || 'null');
      setAuthDebug('User: ' + (user?.uid || 'null') + ', Email: ' + (user?.email || 'null'));

      setLoading(true);
      try {
        if (user) {
          // Load user settings from Firestore
          try {
            const settings = await fetchUserSettings(user.uid);
            setAdminName(settings.adminName);
            setAdminAvatar(settings.adminAvatar);
            setAdminColor(settings.adminColor);
            setAdminDob(settings.adminDob);
            setParentEmailInput(settings.parentEmail);
          } catch (e) {
            console.log('No settings found, using defaults');
          }

          // Check if user is a child by matching email
          try {
            // Try to fetch child by email - this looks up the linked account
            const childResult = await fetchChildByEmail(user.email || '');
            if (childResult.child && childResult.child.length > 0) {
              console.log('Found child profile:', childResult.child[0].name);
              setChildProfile(childResult.child[0]);

              // Store parent UID for profile switching
              if (childResult.parentUid) {
                setParentUid(childResult.parentUid);
              }

              // Update allChildren with FULL data for dual schedule
              if (childResult.allChildren.length > 0) {
                console.log('Storing allChildren with full curriculum:', childResult.allChildren.length);
                // Store full child profiles (with curriculum) for dual schedule
                setAllChildren(childResult.allChildren);

                // Also set data to all children for dual schedule display
                setData(childResult.allChildren);
              } else {
                setData(childResult.child);
              }

              isFetchingRef.current = false;
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log('Not a child account, checking for admin data');
          }

          console.log('Fetching children for userId:', user.uid);
          setAuthDebug('Fetching children for: ' + user.uid);
          setChildProfile(null);
          const childrenData = await fetchChildren(user.uid);
          console.log('Got childrenData:', childrenData.length, 'children');
          setAuthDebug('Found ' + childrenData.length + ' children');
          if (childrenData.length > 0) {
            setData(childrenData);
          } else {
            console.log('No children found - starting fresh');
            setData([]);
          }
        } else {
          console.log('No user, loading empty state');
          setChildProfile(null);
          setData([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setData(getLocalData());
      }
      setLoading(false);
      isFetchingRef.current = false;
    };
    loadData();
  }, [user, authLoading]);

  // Auto-detect child sign-in based on googleEmail match
  useEffect(() => {
    console.log('Child sign-in check:', { user: user?.email, authLoading, loading, dataLength: data.length, childProfile: !!childProfile });

    if (authLoading || loading) return;

    // If no user signed in, clear childProfile
    if (!user) {
      setChildProfile(null);
      return;
    }

    const userEmail = user.email?.toLowerCase() || '';
    console.log('Checking for match:', userEmail);
    console.log('Children emails:', data.map(c => ({ name: c.name, email: c.googleEmail })));

    const matchedChild = data.find(child =>
      child.googleEmail?.toLowerCase() === userEmail
    );

    if (matchedChild) {
      console.log('Auto-detected child sign-in:', matchedChild.name);
      setChildProfile(matchedChild);
      navigate(`/child/${matchedChild.id}`);
    } else if (childProfile && userEmail) {
      // Verify current childProfile still matches signed-in user
      const currentChildEmail = childProfile.googleEmail?.toLowerCase() || '';
      if (currentChildEmail !== userEmail) {
        // User changed - clear child profile
        setChildProfile(null);
      }
    }
  }, [user, data, authLoading, loading]);

  // Update allChildren list when data changes (for profile switching)
  useEffect(() => {
    // Only update allChildren if we have more than 1 child (parent login)
    // or if allChildren is empty
    if (data.length > 1 || allChildren.length === 0) {
      const childrenList = data.map(c => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        themeColor: c.themeColor
      }));
      setAllChildren(childrenList);
    }
  }, [data]);



  // --- Child Management Functions ---

  const handleAddChild = (childData: Omit<ChildProfile, 'id' | 'yearGroups'>) => {
    const newChild: ChildProfile = {
      ...childData,
      id: Math.random().toString(36).substr(2, 9),
      yearGroups: [],
    };
    setData(prev => {
      const newData = [...prev, newChild];
      saveData(newData, user);
      return newData;
    });
  };

  const handleDeleteChild = (id: string) => {
    setData(prev => {
      const newData = prev.filter(child => child.id !== id);
      saveData(newData, user);
      return newData;
    });
  };

  const handleUpdateChild = (id: string, updates: Partial<ChildProfile>) => {
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== id) return child;
        return { ...child, ...updates };
      });
      saveData(newData, user);
      return newData;
    });
  };

  const handleUpdateChildProfile = (updates: Partial<ChildProfile>) => {
    if (childProfile) {
      const updated = { ...childProfile, ...updates };
      setChildProfile(updated);
      const allChildren = data.map(c => c.id === updated.id ? updated : c);
      saveData(allChildren, user);
    }
  };

  const handleAddYearGroup = (childId: string, name: string) => {
    const newYearGroup: YearGroup = {
      id: `${childId}-${name.replace(/\s+/g, '').toLowerCase()}`,
      name,
      subjects: [],
    };
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return { ...child, yearGroups: [...child.yearGroups, newYearGroup] };
      });
      saveData(newData, user);
      return newData;
    });
  };

  const handleRemoveYearGroup = (childId: string, yearGroupId: string) => {
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return { ...child, yearGroups: child.yearGroups.filter(yg => yg.id !== yearGroupId) };
      });
      saveData(newData, user);
      return newData;
    });
  };

  // --- Schedule Generator Logic ---

  const shuffle = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const generateSchedule = useCallback((hours: number) => {
    const blocks: ScheduleBlock[] = [];
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);

    let currentTime = new Date(now);

    // Include ALL children - not filter out
    const allChildren = data.filter(child => {
      const subjects = child.yearGroups.flatMap(yg => yg.subjects);
      return subjects.length > 0;
    });

    if (allChildren.length === 0) {
      alert("Please add more subjects/lessons first!");
      return;
    }

    // Pre-shuffle subjects for each child and weight by frequency
    const childSubjects: Record<string, { subjects: any[], topics: any[], subjectIndex: number, topicIndex: number }> = {};

    // Read frequency modes from localStorage
    const storedChildFreqMode = localStorage.getItem('childFreqMode');
    const childFreqMode = storedChildFreqMode ? JSON.parse(storedChildFreqMode) : ['balanced', 'balanced'];

    // Read per-subject frequency overrides from localStorage
    const storedFreqSophia = localStorage.getItem('freqModeSophia');
    const storedFreqAdrian = localStorage.getItem('freqModeAdrian');
    const freqModeSophia = storedFreqSophia ? JSON.parse(storedFreqSophia) : {};
    const freqModeAdrian = storedFreqAdrian ? JSON.parse(storedFreqAdrian) : {};

    allChildren.forEach((child, childIdx) => {
      const subjects = shuffle(child.yearGroups.flatMap(yg => yg.subjects));
      // Flatten all topics from all subjects and weight by frequency
      const allTopics: any[] = [];
      subjects.forEach((s: any, subjIdx: number) => {
        s.topics.forEach((t: any) => {
          // Use topic's own frequency if set, otherwise use subject weight
          const topicFreq = t.frequency || getSubjectWeight(s.name, childIdx, childFreqMode, freqModeSophia, freqModeAdrian);
          // Add topic multiple times based on frequency (1-3x)
          for (let i = 0; i < topicFreq; i++) {
            allTopics.push({ ...t, subjectId: s.id, subjectName: s.name, subjectColor: s.color });
          }
        });
      });
      childSubjects[child.id] = { subjects, topics: shuffle(allTopics), subjectIndex: 0, topicIndex: 0 };
    });

    for (let i = 0; i < hours; i++) {
      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime.getTime() + 50 * 60000);

      const blockChildren: ScheduleBlock['children'] = {};
      const hasDevice = i % allChildren.length;

      allChildren.forEach((child, idx) => {
        const childData = childSubjects[child.id];
        if (!childData) return;

        // Get next topic - cycle through all topics
        const topicData = childData.topics[childData.topicIndex % childData.topics.length];
        if (!topicData) return;

        // Get lesson from topic
        const lesson = topicData.lessons.find((l: any) => !l.completed && !l.deleted)
          || topicData.lessons.find((l: any) => !l.deleted)
          || topicData.lessons[0];
        if (!lesson) return;

        blockChildren[child.id] = {
          subjectId: topicData.subjectId,
          topicId: topicData.id,
          subjectName: topicData.subjectName,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          hasDevice: idx === hasDevice
        };

        // Advance to next topic
        childData.topicIndex++;
      });

      blocks.push({
        id: `block-${i}`,
        type: 'academic',
        startTime,
        endTime,
        children: blockChildren
      });

      currentTime = endTime;

      if (i < hours - 1) {
        if (i === 1) {
          const lunchEnd = new Date(currentTime.getTime() + 40 * 60000);
          blocks.push({
            id: `lunch-${i}`,
            type: 'lunch',
            startTime: currentTime,
            endTime: lunchEnd,
            label: "Lunch & Free Time",
            children: {}
          });
          currentTime = lunchEnd;
        } else {
          const breakEnd = new Date(currentTime.getTime() + 10 * 60000);
          blocks.push({
            id: `break-${i}`,
            type: 'break',
            startTime: currentTime,
            endTime: breakEnd,
            label: "Refresh Break",
            children: {}
          });
          currentTime = breakEnd;
        }
      }
    }

    setSchedule(blocks);
    setIsDayActive(true);
  }, [data, shuffle]);


  // --- Curriculum Actions ---
  const handleCompleteLesson = (childId: string, subjectId: string, topicId: string, lessonId: string, timeSpentSeconds: number) => {
    console.log('handleCompleteLesson called:', { childId, subjectId, topicId, lessonId });
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(sub => {
              if (sub.id !== subjectId) return sub;
              return {
                ...sub,
                topics: sub.topics.map(topic => {
                  if (topic.id !== topicId) return topic;
                  const completedCountBefore = topic.lessons.filter(l => l.completed).length;
                  console.log('Topic found, lessons before:', completedCountBefore, 'completed out of', topic.lessons.length);
                  console.log('Target lessonId:', lessonId);

                  const updatedLessons = topic.lessons.map(l => {
                    const isTarget = l.id === lessonId;
                    console.log('Mapping:', l.id.substring(0, 25), 'MATCH=', isTarget);
                    if (isTarget) {
                      console.log('>>> MARKING COMPLETE:', l.id);
                      return { ...l, completed: true, timeSpentSeconds };
                    }
                    return l;
                  });

                  const completedCountAfter = updatedLessons.filter(l => l.completed).length;
                  console.log('Lessons after:', completedCountAfter, 'completed - should be', completedCountBefore + 1);

                  const updated = { ...topic, lessons: updatedLessons };
                  return updated;
                })
              };
            })
          }))
        };
      });
      saveData(newData, user);
      return newData;
    });

    // URL routing handles navigation after completion
  };

  const handleBulkImport = (rows: ParsedRow[]) => {
    // Guard against multiple calls in quick succession
    if ((window as any).__handleBulkImportRunning) {
      console.log('handleBulkImport: Already running, skipping');
      return;
    }
    (window as any).__handleBulkImportRunning = true;

    // Process data with proper deduplication
    // Duplicate = same child + same year + same subject + same topic + same lesson title
    // NOT duplicate = same child + different year (repeating)

    const newData = [...data];

    rows.forEach(row => {
      if (!row.isValid) return;

      // Find or create child
      let child = newData.find(c => c.name.toLowerCase() === row.childName.toLowerCase());
      if (!child) {
        child = {
          id: `child-${row.childName.toLowerCase().replace(/\s+/g, '-')}`,
          name: row.childName,
          dob: '',
          avatar: '👶',
          themeColor: 'blue',
          yearGroups: []
        };
        newData.push(child);
      }

      // Find or create year group
      let yearGroup = child.yearGroups.find(yg => yg.name.toLowerCase() === row.yearGroup.toLowerCase());
      if (!yearGroup) {
        yearGroup = {
          id: `${child.id}-${row.yearGroup.replace(/\s+/g, '').toLowerCase()}`,
          name: row.yearGroup,
          subjects: []
        };
        child.yearGroups.push(yearGroup);
      }

      // Find or create subject
      let subject = yearGroup.subjects.find(s => s.name.toLowerCase() === row.subjectCategory.toLowerCase());
      if (!subject) {
        let color = 'bg-gray-100 text-gray-800';
        const cat = row.subjectCategory.toLowerCase();
        if (cat.includes('math')) color = 'bg-blue-100 text-blue-800';
        else if (cat.includes('english')) color = 'bg-amber-100 text-amber-800';
        else if (cat.includes('science')) color = 'bg-green-100 text-green-800';
        else if (cat.includes('humanities')) color = 'bg-orange-100 text-orange-800';
        else if (cat.includes('creative')) color = 'bg-purple-100 text-purple-800';

        subject = {
          id: `${child.id}-${row.yearGroup.replace(/\s+/g, '')}-${row.subjectCategory}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
          name: row.subjectCategory,
          category: row.subjectCategory as any,
          color,
          topics: []
        };
        yearGroup.subjects.push(subject);
      }

      // Find or create topic
      const topicName = row.subjectName || 'General';
      let topic = subject.topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
      if (!topic) {
        const sanitizedTopicName = topicName.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-');
        topic = {
          id: `${subject.id}-topic-${sanitizedTopicName}-${Date.now()}`.slice(0, 50),
          name: topicName,
          lessons: []
        };
        subject.topics.push(topic);
      }

      // Generate lesson title
      const lessonTitle = row.lessonTitle ||
        row.lessonNotes ||
        (row.videoUrl ? `Lesson ${topic.lessons.length + 1}` : `Lesson ${topic.lessons.length + 1}`);

      // Check for duplicate: same child + year + subject + topic + lesson title
      const duplicateLesson = topic.lessons.find(l =>
        l.title.toLowerCase() === lessonTitle.toLowerCase()
      );

      if (duplicateLesson) {
        console.log('Duplicate found, skipping:', lessonTitle);
        return; // Skip this row
      }

      // Add new lesson - include videoPosition to ensure unique IDs
      const lessonIndex = row.videoPosition || topic.lessons.length + 1;
      const newLesson: Lesson = {
        id: `${topic.id}-${lessonIndex}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
        title: lessonTitle,
        durationMinutes: 45,
        completed: false,
        deleted: false,
        videoUrl: row.videoUrl || '',
        outcomes: row.lessonFocus ? row.lessonFocus.split(',').map((s: string) => s.trim()) : [],
        lessonFocus: row.lessonFocus || '',
        lessonNotes: row.lessonNotes || '',
        videoPosition: row.videoPosition || topic.lessons.length + 1
      };
      topic.lessons.push(newLesson);
    });

    console.log('handleBulkImport: Processed', newData.length, 'children');

    // Update state and save
    setData(newData);

    saveData(newData, user);

    navigate('/dashboard');
  };

  const handleDeleteSubject = async (childId: string, subjectId: string) => {
    const scrollY = window.scrollY;

    if (user) {
      await hardDeleteSubjectFromFirebase(subjectId, childId, user.uid).catch(err => {
        console.error('Failed to delete subject from Firebase:', err);
      });
    }

    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.filter(s => s.id !== subjectId)
          }))
        };
      });
      saveData(newData, user);
      return newData;
    });

    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  };

  const handleAddLesson = (childId: string, subjectId: string, topicId: string, title: string) => {
    if (!title.trim()) return;
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(sub => {
              if (sub.id !== subjectId) return sub;
              return {
                ...sub,
                topics: sub.topics.map(topic => {
                  if (topic.id !== topicId) return topic;
                  const newLesson: Lesson = {
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    durationMinutes: 45,
                    completed: false,
                    deleted: false,
                    outcomes: [],
                    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
                  };
                  return {
                    ...topic,
                    lessons: [...topic.lessons, newLesson]
                  };
                })
              };
            })
          }))
        };
      });
      saveData(newData, user);
      return newData;
    });
  };

  const handleRestoreLesson = async (childId: string, subjectId: string, topicId: string, lessonId: string) => {
    // Firebase: state is updated locally, sync happens via saveFullCurriculum

    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(sub => {
              if (sub.id !== subjectId) return sub;
              return {
                ...sub,
                topics: sub.topics.map(topic => {
                  if (topic.id !== topicId) return topic;
                  return {
                    ...topic,
                    lessons: topic.lessons.map(l => l.id === lessonId ? { ...l, deleted: false } : l)
                  };
                })
              };
            })
          }))
        };
      });
      saveData(newData, user);
      return newData;
    });
  };

  const handleHardDeleteLesson = (childId: string, subjectId: string, topicId: string, lessonId: string) => {
    console.log('Deleting lesson:', lessonId, 'from topic:', topicId);

    if (!lessonId) {
      console.error('Cannot delete: lessonId is undefined');
      return;
    }

    // Firebase sync handled by saveFullCurriculum below

    setData(prevData => {
      // Deep clone to avoid mutation issues
      const newData = JSON.parse(JSON.stringify(prevData));

      const targetChild = newData.find((c: any) => c.id === childId);
      if (!targetChild) return prevData;

      const targetYG = targetChild.yearGroups.find((yg: any) =>
        yg.subjects.some((s: any) => s.id === subjectId)
      );
      if (!targetYG) return prevData;

      const targetSub = targetYG.subjects.find((s: any) => s.id === subjectId);
      if (!targetSub) return prevData;

      const targetTopic = targetSub.topics.find((t: any) => t.id === topicId);
      if (!targetTopic) {
        console.error('Topic not found:', topicId);
        console.log('Available topics:', targetSub.topics.map((t: any) => t.id));
        return prevData;
      }

      const originalCount = targetTopic.lessons.length;
      targetTopic.lessons = targetTopic.lessons.filter((l: any) => l.id !== lessonId);

      console.log(`Deleted ${originalCount - targetTopic.lessons.length} lessons`);

      saveData(newData, user);

      return newData;
    });
  };

  const handleSoftDeleteLesson = (childId: string, subjectId: string, topicId: string, lessonId: string) => {
    // Firebase sync handled by saveFullCurriculum below

    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(sub => {
              if (sub.id !== subjectId) return sub;
              return {
                ...sub,
                topics: sub.topics.map(topic => {
                  if (topic.id !== topicId) return topic;
                  return {
                    ...topic,
                    lessons: topic.lessons.map(l => l.id === lessonId ? { ...l, deleted: true } : l)
                  };
                })
              };
            })
          }))
        };
      });
      saveData(newData, user);
      return newData;
    });
  };

  const handleUpdateTopicFrequency = (childId: string, subjectId: string, topicId: string, frequency: number) => {
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(s => {
              if (s.id !== subjectId) return s;
              return {
                ...s,
                topics: s.topics.map(t => {
                  if (t.id !== topicId) return t;
                  return { ...t, frequency };
                })
              };
            })
          }))
        };
      });
      saveData(newData, user);
      return newData;
    });
  };



  // --- Main Render Switch ---

  return (
    <>
      <Routes>
        <Route path="/landingview" element={<LandingView />} />
        <Route path="/" element={<LandingView />} />
        <Route path="/returningview" element={<ReturningView childProfile={childProfile} data={data} onNavigate={(nav) => {
          if (nav.type === 'KIDSDASH') {
            window.location.href = '/kiddash?child=' + nav.childId;
          } else if (nav.type === 'HOME') {
            window.location.href = '/admindash';
          } else if (nav.type === 'LANDING') {
            window.location.href = '/';
          } else if (nav.type === 'ADMIN') {
            window.location.href = '/admindash';
          }
        }} />} />
        <Route path="/admindash" element={<AdminDash />} />
        <Route path="/lessonview" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><LessonView childId={new URLSearchParams(window.location.search).get('child') || 'sophia'} lessonId={new URLSearchParams(window.location.search).get('lesson') || ''} /></Suspense>} />
        <Route path="/admin" element={<Navigate to="/admindash" replace />} />
        <Route path="/curriculum" element={<Navigate to="/admindash" replace />} />
        <Route path="/marketplace" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Marketplace /></Suspense>} />
        <Route path="/temp-grid" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><TempGridView /></Suspense>} />
        <Route path="/manage" element={<Navigate to="/admindash" replace />} />
        <Route path="/kiddash" element={<KidDash childId={new URLSearchParams(window.location.search).get('child') || 'sophia'} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modals - outside of Routes */}
      {showChildManagement && (
        <ChildManagement
          children={data}
          onAddChild={handleAddChild}
          onUpdateChild={handleUpdateChild}
          onDeleteChild={handleDeleteChild}
          onAddYearGroup={handleAddYearGroup}
          onRemoveYearGroup={handleRemoveYearGroup}
          onClose={() => setShowChildManagement(false)}
        />
      )}

      {showEditProfile && editingChildId && (
        <EditProfile
          child={data.find(c => c.id === editingChildId) || childProfile!}
          onSave={(updates) => {
            if (editingChildId === 'childProfile' && childProfile) {
              handleUpdateChildProfile(updates);
            } else {
              handleUpdateChild(editingChildId, updates);
            }
          }}
          onClose={() => { setShowEditProfile(false); setEditingChildId(null); }}
        />
      )}

      {/* Admin Avatar Edit Modal */}
      {showEditAdmin && (
        <AdminAvatarEditModal
          currentAvatar={adminAvatar}
          onSave={async (avatar) => {
            setAdminAvatar(avatar);
            if (user?.uid) {
              await saveUserSettings(user.uid, { adminAvatar: avatar });
            }
            setShowEditAdmin(false);
          }}
          onClose={() => setShowEditAdmin(false)}
        />
      )}
    </>
  );
};



export default App;