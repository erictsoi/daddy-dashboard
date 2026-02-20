import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { ViewState, ChildProfile, YearGroup, Subject, Topic, Lesson, ScheduleBlock, ViewOrigin, ParsedRow } from './types';
import { INITIAL_DATA } from './constants';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { auth as firebaseAuth, googleProvider, signInWithGoogle, logOut as firebaseLogOut } from './src/lib/firebase'
import { fetchChildren, fetchChildByEmail, fetchChildById, getLocalData, saveFullCurriculum, softDeleteLessonInFirebase, hardDeleteLessonFromFirebase, hardDeleteSubjectFromFirebase, migrateChildToTopicStructure, fetchUserSettings, saveUserSettings, UserSettings } from './src/lib/dataService';
import { usePersistentTimer } from './src/lib/useTimer';
import { saveData, generateUuid, exportDataToFile } from './src/lib/helpers';
import { ProgressBar } from './components/ProgressBar';
import { LessonPlayer } from './components/LessonPlayer';
import { Timeline } from './components/Timeline';
const CurriculumBuilder = lazy(() => import('./components/CurriculumBuilder').then(m => ({ default: m.CurriculumBuilder })));
const AdminDash = lazy(() => import('./views/AdminDash').then(m => ({ default: m.AdminDash })));
const KidDash = lazy(() => import('./views/KidDash').then(m => ({ default: m.KidDash })));
const LessonView = lazy(() => import('./views/LessonView').then(m => ({ default: m.LessonView })));
const ReturningView = lazy(() => import('./views/ReturningView').then(m => ({ default: m.ReturningView })));
import { LandingView } from './views/LandingView';

import { AdminAvatarEditModal } from './app/AdminAvatarEditModal';

// Helper for grid columns
const getGridCols = (count: number): string => {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
};

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
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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
import { 
  Users, 
  Book, 
  Plus, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  PlayCircle, 
  Sparkles,
  Layout,
  GraduationCap,
  Calendar,
  Clock,
  Play,
  BarChart3,
  CheckCircle,
  ArrowLeft,
  Trash2,
  MoreVertical,
  RotateCcw,
  Edit2,
  X,
  XCircle,
  Archive,
  Lock,
  LogOut,
  User,
  UserCircle,
  UserPlus,
  Timer,
  Settings,
  Upload,
  Download,
  Cloud
} from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth() || {};
  const [view, setView] = useState<ViewState>({ type: 'LANDING' });
  const [data, setData] = useState<ChildProfile[]>([]);
  
  // Helper to calculate grid columns based on number of cards
  const getGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };
  const totalCards = 1 + data.length; // Daddy + kids
  const gridCols = getGridCols(totalCards);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [allChildren, setAllChildren] = useState<{id: string, name: string, avatar: string, themeColor: string, yearGroups?: any[]}[]>([]);
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
  
  // Firebase status indicator
  const [supabaseStatus, setSupabaseStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [authDebug, setAuthDebug] = useState<string>('');
  
  const showStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSupabaseStatus({ message, type });
    setTimeout(() => setSupabaseStatus(null), 4000);
  };
  
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
      allChildren.forEach(child => {
        const subjects = shuffle(child.yearGroups.flatMap(yg => yg.subjects));
        // Flatten all topics from all subjects and weight by frequency
        const allTopics: any[] = [];
        subjects.forEach((s: any) => {
          s.topics.forEach((t: any) => {
            const frequency = t.frequency || 3;
            // Add topic multiple times based on frequency (1-5x)
            for (let i = 0; i < frequency; i++) {
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
                    console.log('Mapping:', l.id.substring(0,25), 'MATCH=', isTarget);
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

    if (view.type === 'LESSON_PLAYER') {
        setView({ 
            type: 'SUBJECT_DETAIL', 
            childId, 
            subjectId, 
            origin: view.origin 
        });
    }
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

  // --- Components for Views ---

  const OldLandingView = () => {
    const { user, signInWithGoogle, signOut, loading } = useAuth() || {};
    const navigate = useNavigate();

    if (childProfile) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            <div className={`w-32 h-32 rounded-full bg-${childProfile.themeColor}-50 flex items-center justify-center text-6xl mx-auto mb-4 relative group`}>
              {childProfile.avatar}
              <button
                onClick={() => { setEditingChildId('childProfile'); setShowEditProfile(true); }}
                className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                title="Edit Profile"
              >
                <Settings size={16} className="text-gray-600" />
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{childProfile.name}'s Space</h1>
            <p className="text-gray-500">Ready to learn today?</p>
          </div>
           
          <button
            onClick={() => navigate(`/child/${childProfile.id}`)}
            className={`bg-${childProfile.themeColor}-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-${childProfile.themeColor}-700 hover:scale-105 transition-all flex items-center gap-3 mb-8`}
          >
            <Play size={24} fill="currentColor"/> Let's Learn!
          </button>

          <button
            onClick={() => signOut?.()}
            className="text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 p-6">
          {/* Header with Sign In */}
          <div className="flex justify-between items-center mb-12">
              <div>
                  <h1 className="text-4xl font-bold text-gray-800">Daddy Dashboard</h1>
                  <p className="text-xl text-gray-500">Who is learning today?</p>
              </div>
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/manage')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Settings size={18} />
                    Manage Children
                  </button>
                  <button
                    onClick={() => signOut?.()}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle?.()}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? '...' : 'Sign in'}
                </button>
              )}
          </div>

          {/* Profile Cards */}
          <div className={`grid ${gridCols} justify-items-center gap-6 w-full max-w-6xl mx-auto`}>
              {/* Daddy Card */}
              <div className="relative group w-full max-w-xs">
                <button 
                    onClick={() => setView({ type: 'HOME' })}
                    className="w-full bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 flex flex-col items-center gap-6 border border-gray-100 group"
                >
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-6xl group-hover:bg-gray-200 transition">
                        {adminAvatar}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'}</h2>
                        <p className="text-gray-500 mt-2">Dashboard & Admin</p>
                    </div>
                </button>
                {/* Edit button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEditAdmin(true); }}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  title="Edit Admin Profile"
                >
                  <Settings size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Kids Cards */}
              {data.map(child => (
                  <div key={child.id} className="relative group w-full max-w-xs">
                    <button
                        onClick={() => navigate(`/child/${child.id}`)}
                        className={`w-full bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 flex flex-col items-center gap-6 border-b-[8px] border-${child.themeColor}-500`}
                    >
                        <div className={`w-32 h-32 rounded-full bg-${child.themeColor}-50 flex items-center justify-center text-6xl group-hover:bg-${child.themeColor}-100 transition`}>
                            {child.avatar}
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800">{child.name || 'Student'}</h2>
                            <p className={`text-${child.themeColor}-600 font-medium mt-2`}>Student Access</p>
                        </div>
                    </button>
                    {/* Edit button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingChildId(child.id); setShowEditProfile(true); }}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                      title="Edit Profile"
                    >
                      <Settings size={16} className="text-gray-600" />
                    </button>
                  </div>
              ))}
          </div>
          
          {/* Guest Mode Notice */}
          {!user && (
            <div className="mt-12 text-center max-w-2xl mx-auto">
              <p className="text-gray-500 text-sm mb-4">
                You're viewing the demo mode. Sign in with Google to save your custom curriculum data.
              </p>
              
              {/* Parent Email Input for Kids */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2">For Kids</h3>
                <p className="text-sm text-gray-500 mb-4">Enter your parent's email to access your profile</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="parent-email"
                    name="parentEmail"
                    value={parentEmailInput}
                    onChange={(e) => setParentEmailInput(e.target.value)}
                    placeholder="parent@email.com"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      signInWithGoogle?.();
                    }}
                    disabled={!parentEmailInput || loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    );
  };

  const SubjectDetail = ({ childId, subjectId, origin }: { childId: string, subjectId: string, origin: ViewOrigin }) => {
    const child = data.find(c => c.id === childId);
    const yg = child?.yearGroups.find(y => y.subjects.some(s => s.id === subjectId));
    const subject = yg?.subjects.find(s => s.id === subjectId);
    const { signOut } = useAuth() || {};
    
    const [showTrash, setShowTrash] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
    const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [editingLesson, setEditingLesson] = useState<{ lessonId: string; title: string; focus: string; notes: string; videoUrl: string } | null>(null);
    const [editingTopic, setEditingTopic] = useState<{ topicId: string; name: string } | null>(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    
    // Admin Mode Check
    const isReadOnly = origin === 'CHILD_DASHBOARD';

    const toggleTopic = useCallback((topicId: string) => {
      setExpandedTopics(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(topicId)) {
          newExpanded.delete(topicId);
        } else {
          newExpanded.add(topicId);
        }
        return newExpanded;
      });
    }, []);

    // Expand all topics by default
    useEffect(() => {
      if (subject?.topics) {
        const allTopicIds = subject.topics.map(t => t.id);
        setExpandedTopics(new Set(allTopicIds));
      }
    }, [subject?.topics]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
          setShowProfileDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Aggregate stats across all topics - memoized
    const allActiveLessons = useMemo(() => 
      subject?.topics.flatMap(t => t.lessons.filter(l => !l.deleted)) || [], 
      [subject]
    );
    const allDeletedLessons = useMemo(() => 
      subject?.topics.flatMap(t => t.lessons.filter(l => l.deleted)) || [], 
      [subject]
    );
    const completedCount = useMemo(() => 
      allActiveLessons.filter(l => l.completed).length, 
      [allActiveLessons]
    );

    const handleToggleComplete = useCallback((lessonId: string) => {
      setData(prev => {
        const newData = prev.map(ch => {
            if (ch.id !== childId) return ch;
            return {
                ...ch,
                yearGroups: ch.yearGroups.map(y => ({
                    ...y,
                    subjects: y.subjects.map(s => {
                        if (s.id !== subjectId) return s;
                        return {
                            ...s,
                            topics: s.topics.map(t => ({
                                ...t,
                                lessons: t.lessons.map(l => {
                                    if (l.id !== lessonId) return l;
                                    return { ...l, completed: !l.completed };
                                })
                            }))
                        };
                    })
                }))
            };
        });
        saveData(newData, user);
        return newData;
      });
    }, [childId, subjectId, user]);

    const handleDeleteTopic = (topicId: string) => {
      if (!confirm('Delete this topic and all its lessons?')) return;
      
      // Delete from Firebase if exists
      if (user) {
        hardDeleteSubjectFromFirebase(topicId, user.uid).catch(err => {
          console.error('Failed to delete topic from Firebase:', err);
        });
      }

      setData(prev => {
        const newData = prev.map(ch => {
          if (ch.id !== childId) return ch;
          return {
            ...ch,
            yearGroups: ch.yearGroups.map(y => ({
              ...y,
              subjects: y.subjects.map(s => {
                if (s.id !== subjectId) return s;
                const updatedTopics = s.topics.filter(t => t.id !== topicId);
                // Only return subject if it still has topics
                if (updatedTopics.length === 0) {
                  return null;
                }
                return {
                  ...s,
                  topics: updatedTopics
                };
              }).filter(Boolean) // Remove null subjects (no topics left)
            }))
          };
        });
        saveData(newData, user);
        return newData;
      });
    };

    const handleAddLessonSubmit = (topicId: string) => {
      if (!newLessonTitle.trim()) return;
      handleAddLesson(childId, subjectId, topicId, newLessonTitle);
      setNewLessonTitle("");
      setAddingLessonTo(null);
    };

    const handleStartEditLesson = (lesson: Lesson) => {
      setEditingLesson({
        lessonId: lesson.id,
        title: lesson.title,
        focus: lesson.lessonFocus || '',
        notes: lesson.lessonNotes || '',
        videoUrl: lesson.videoUrl || ''
      });
    };

    const handleSaveLesson = () => {
      if (!editingLesson) return;
      setData(prev => {
        const newData = prev.map(ch => {
          if (ch.id !== childId) return ch;
          return {
            ...ch,
            yearGroups: ch.yearGroups.map(y => ({
              ...y,
              subjects: y.subjects.map(s => {
                if (s.id !== subjectId) return s;
                return {
                  ...s,
                  topics: s.topics.map(t => ({
                    ...t,
                    lessons: t.lessons.map(l => {
                      if (l.id !== editingLesson.lessonId) return l;
                      return {
                        ...l,
                        title: editingLesson.title,
                        lessonFocus: editingLesson.focus || undefined,
                        lessonNotes: editingLesson.notes || undefined,
                        videoUrl: editingLesson.videoUrl || undefined
                      };
                    })
                  }))
                };
              })
            }))
          };
        });
        saveData(newData, user);
        return newData;
      });
      setEditingLesson(null);
    };

    const handleStartEditTopic = (topic: any) => {
      setEditingTopic({
        topicId: topic.id,
        name: topic.name
      });
    };

    const handleSaveTopic = () => {
      if (!editingTopic) return;
      setData(prev => {
        const newData = prev.map(ch => {
          if (ch.id !== childId) return ch;
          return {
            ...ch,
            yearGroups: ch.yearGroups.map(y => ({
              ...y,
              subjects: y.subjects.map(s => {
                if (s.id !== subjectId) return s;
                return {
                  ...s,
                  topics: s.topics.map(t => {
                    if (t.id !== editingTopic.topicId) return t;
                    return {
                      ...t,
                      name: editingTopic.name
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
      setEditingTopic(null);
    };

    if (!child || !subject) return <div>Subject not found</div>;

    return (
        <div className="min-h-screen bg-white">
            <header className={`bg-${child.themeColor}-600 text-white p-6 sticky top-0 z-50 shadow-md`}>
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => {
                        if (origin === 'HOME') {
                            navigate('/dashboard');
                        } else {
                            navigate(`/child/${childId}`);
                        }
                    }} className="flex items-center gap-2 hover:opacity-80 mb-4 transition">
                        <ArrowLeft size={20}/> Back to {isReadOnly ? `${child.name}'s Space` : `${adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'} Dashboard`}
                    </button>
                    <div className="flex justify-between items-end relative">
                        <div>
                             <h1 className="text-3xl font-bold">{subject.name}</h1>
                             <p className="opacity-90">{child.name} • {yg?.name}</p>
                        </div>
                        <div className="relative" ref={profileDropdownRef}>
                            <button 
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="text-4xl ml-4 hover:scale-110 transition cursor-pointer"
                            >
                                {child.avatar}
                            </button>
                            {showProfileDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                            <div className="px-3 py-2 border-b border-gray-100">
                                <p className="font-medium text-sm text-gray-500">Switch Profile</p>
                            </div>
                            {user && !childProfile && (
                                        <button
                                            onClick={() => { setView({ type: 'HOME' }); setShowProfileDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                        >
                                            <div 
                                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                              style={{ 
                                                backgroundColor: adminColor === 'blue' ? '#1e40af' : 
                                                                adminColor === 'indigo' ? '#3730a3' :
                                                                adminColor === 'purple' ? '#6b21a8' :
                                                                adminColor === 'pink' ? '#9d174d' :
                                                                adminColor === 'rose' ? '#be123c' :
                                                                adminColor === 'red' ? '#b91c1c' :
                                                                adminColor === 'orange' ? '#c2410c' :
                                                                adminColor === 'amber' ? '#b45309' :
                                                                adminColor === 'yellow' ? '#a16207' :
                                                                adminColor === 'green' ? '#15803d' :
                                                                adminColor === 'emerald' ? '#047857' :
                                                                adminColor === 'teal' ? '#0f766e' :
                                                                adminColor === 'cyan' ? '#0e7490' :
                                                                adminColor === 'sky' ? '#0369a1' :
                                                                '#475569'
                                              }}
                                            >
                                              {adminAvatar}
                                            </div>
                                            <div>
                                                <span className="font-medium block">{adminName || user?.user_metadata?.full_name || user?.email}</span>
                                                <span className="text-xs text-gray-500">{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'} Dashboard</span>
                                            </div>
                                        </button>
                            )}
                            {allChildren.filter(c => c.id !== childProfile?.id).map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { navigate(`/child/${c.id}`); setShowProfileDropdown(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${c.themeColor}-100`}>
                                        {c.avatar}
                                    </div>
                                    <div>
                                        <span className="font-medium block">{c.name}</span>
                                        <span className="text-xs text-gray-500">Student Access</span>
                                    </div>
                                </button>
                            ))}
                            {user && !childProfile && (
                                        <>
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={() => { navigate('/manage'); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                                >
                                                    <Edit2 size={16} />
                                                    Manage Profiles
                                                </button>
                                                <button
                                                    onClick={() => { /* TODO: Account page */ }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                                >
                                                    <User size={16} />
                                                    Account
                                                </button>
                                                <button
                                                    onClick={() => { signOut?.(); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left text-sm"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                  {/* Stats */}
                  <div className="flex gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1">
                          <div className="text-sm text-gray-500">Active Lessons</div>
                          <div className="text-2xl font-bold text-gray-800">{allActiveLessons.length}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1">
                          <div className="text-sm text-gray-500">Completed</div>
                          <div className={`text-2xl font-bold text-${child.themeColor}-600`}>
                              {completedCount}
                          </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1">
                          <div className="text-sm text-gray-500">Topics</div>
                          <div className="text-2xl font-bold text-gray-800">{subject.topics.length}</div>
                      </div>
                  </div>

                 {/* Topics List */}
                 <div className="space-y-4">
                     <h2 className="text-xl font-bold text-gray-800">Topics</h2>
                     
                     {subject.topics.length === 0 ? (
                         <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                             No topics yet. Add curriculum to create topics!
                         </div>
                     ) : (
                         subject.topics.map((topic) => {
                           const topicActiveLessons = topic.lessons.filter(l => !l.deleted);
                           const topicCompleted = topicActiveLessons.filter(l => l.completed).length;
                           const isExpanded = expandedTopics.has(topic.id);
                           
                           return (
                              <div key={topic.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                 {editingTopic?.topicId === topic.id ? (
                                  <div className="px-6 py-4 bg-gray-50 flex items-center gap-3">
                                    <input
                                      type="text"
                                      ref={(el) => { if (el) { el.focus({ preventScroll: true }); } }}
                                      value={editingTopic.name}
                                      onChange={(e) => setEditingTopic({ ...editingTopic, name: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTopic();
                                        if (e.key === 'Escape') setEditingTopic(null);
                                      }}
                                      className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <button
                                      onClick={handleSaveTopic}
                                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingTopic(null)}
                                      className="px-3 py-1 text-gray-500 text-sm hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                                  >
                                     <div 
                                       className="flex items-center gap-3 flex-1"
                                       onClick={() => toggleTopic(topic.id)}
                                     >
                                       {isExpanded ? (
                                         <ChevronDown size={20} className="text-gray-500" />
                                       ) : (
                                         <ChevronRight size={20} className="text-gray-500" />
                                       )}
                                       <span className="font-semibold text-gray-800">{topic.name}</span>
                                       <span className="text-sm text-gray-500">
                                         {topicActiveLessons.length} lessons ({topicCompleted} done)
                                       </span>
                                     </div>
                                      {!isReadOnly && (
                                        <div className="flex items-center gap-2">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStartEditTopic(topic);
                                            }}
                                            className="p-2 text-gray-400 hover:text-blue-500 transition"
                                            title="Edit topic"
                                          >
                                            <Edit2 size={16} />
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTopic(topic.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 transition"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                )}
                               
                               {isExpanded && (
                                 <div className="divide-y divide-gray-100 bg-white">
                                    {topicActiveLessons.length === 0 ? (
                                      <div className="px-6 py-4 text-center text-gray-400 text-sm">
                                        No lessons in this topic
                                      </div>
                                    ) : (
                                      topicActiveLessons.map((lesson, idx) => {
                                        const isEditing = editingLesson?.lessonId === lesson.id;
                                        
                                        return (
                                          <div key={lesson.id} className="p-4">
                                             {isEditing ? (
                                              <div className="space-y-3">
                                                <input
                                                  type="text"
                                                  ref={(el) => { if (el) { el.focus({ preventScroll: true }); } }}
                                                  value={editingLesson.title}
                                                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                  placeholder="Lesson title"
                                                />
                                                <input
                                                  type="text"
                                                  value={editingLesson.focus}
                                                  onChange={(e) => setEditingLesson({ ...editingLesson, focus: e.target.value })}
                                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                  placeholder="Lesson focus/aims"
                                                />
                                                <input
                                                  type="text"
                                                  value={editingLesson.notes}
                                                  onChange={(e) => setEditingLesson({ ...editingLesson, notes: e.target.value })}
                                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                  placeholder="Notes"
                                                />
                                                <input
                                                  type="text"
                                                  value={editingLesson.videoUrl}
                                                  onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                  placeholder="Video URL"
                                                />
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={handleSaveLesson}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingLesson(null)}
                                                    className="px-3 py-1 text-gray-500 text-sm hover:text-gray-700"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition rounded-lg">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    lesson.completed 
                                                      ? 'bg-green-100 text-green-700' 
                                                      : 'bg-gray-100 text-gray-600'
                                                  }`}>
                                                    {lesson.completed ? <CheckCircle size={16} /> : idx + 1}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-800 truncate">{lesson.title}</div>
                                                    {lesson.lessonFocus && (
                                                      <div className="text-sm text-gray-500 truncate">{lesson.lessonFocus}</div>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  {lesson.videoUrl && (
                                                    <PlayCircle 
                                                      size={24} 
                                                      className="text-red-500 cursor-pointer hover:scale-110 transition"
                                                      onClick={() => setView({ 
                                                        type: 'LESSON_PLAYER', 
                                                        childId, 
                                                        subjectId: subject.id,
                                                        topicId: topic.id,
                                                        lessonId: lesson.id,
                                                        origin 
                                                      })}
                                                    />
                                                  )}
                                                  {!isReadOnly && (
                                                    <>
                                                      <button 
                                                        onClick={() => handleStartEditLesson(lesson)}
                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit lesson"
                                                      >
                                                        <Edit2 size={16} />
                                                      </button>
                                                      <button 
                                                        onClick={() => {
                                                          if (confirm('Delete this lesson?')) {
                                                            handleHardDeleteLesson(childId, subjectId, topic.id, lesson.id);
                                                          }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete lesson"
                                                      >
                                                        <Trash2 size={16} />
                                                      </button>
                                                      <button 
                                                        onClick={() => handleToggleComplete(lesson.id)}
                                                        className={`p-2 rounded-lg transition ${
                                                          lesson.completed 
                                                            ? 'text-green-500 hover:bg-green-50' 
                                                            : 'text-gray-300 hover:text-green-500'
                                                        }`}
                                                      >
                                                        <CheckCircle size={20} />
                                                      </button>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                   
                                    {/* Add Lesson button for this topic */}
                                    {!isReadOnly && (
                                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                                         {addingLessonTo === topic.id ? (
                                          <div className="flex gap-2">
                                            <input 
                                              type="text"
                                              ref={(el) => { if (el) { el.focus({ preventScroll: true }); } }}
                                              value={newLessonTitle}
                                              onChange={(e) => setNewLessonTitle(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddLessonSubmit(topic.id);
                                                if (e.key === 'Escape') {
                                                  setAddingLessonTo(null);
                                                  setNewLessonTitle("");
                                                }
                                              }}
                                              placeholder="Lesson title..."
                                              className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <button 
                                              onClick={() => handleAddLessonSubmit(topic.id)}
                                              disabled={!newLessonTitle.trim()}
                                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                            >
                                              Add
                                            </button>
                                            <button 
                                              onClick={() => {
                                                setAddingLessonTo(null);
                                                setNewLessonTitle("");
                                              }}
                                              className="px-3 py-1 text-gray-500 text-sm hover:text-gray-700"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button 
                                            onClick={() => setAddingLessonTo(topic.id)}
                                            className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2"
                                          >
                                            <Plus size={16} /> Add Lesson
                                          </button>
                                        )}
                                      </div>
                                    )}
                                 </div>
                               )}
                             </div>
                           );
                         })
                     )}
                 </div>
      </div>
          </div>
      );
    };

  const ChildDashboard = ({ childId }: { childId: string }) => {
    let child = data.find(c => c.id === childId);
    
    // Fallback to childProfile if needed, with migration
    if (!child && childProfile?.id === childId) {
      child = migrateChildToTopicStructure(childProfile);
    }
    
    if (!child) return null;

    const { user, signOut } = useAuth() || {};
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
          setShowProfileDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`bg-${child.themeColor}-600 text-white pb-24 pt-8 px-6`}>
           <div className="max-w-6xl mx-auto px-6">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h1 className="text-3xl font-bold">{child.name}'s Space</h1>
                     <p className="text-white/80">Ready to learn today?</p>
                  </div>
                  <div className="relative" ref={profileDropdownRef}>
                    <button 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="text-4xl hover:scale-110 transition cursor-pointer"
                    >
                        {child.avatar}
                    </button>
                            {showProfileDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                            <div className="px-3 py-2 border-b border-gray-100">
                                <p className="font-medium text-sm text-gray-500">Switch Profile</p>
                            </div>
                            {user && !childProfile && (
                                <button
                                    onClick={() => { setView({ type: 'HOME' }); setShowProfileDropdown(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                >
                                    <div 
                                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                      style={{ 
                                        backgroundColor: adminColor === 'blue' ? '#1e40af' : 
                                                        adminColor === 'indigo' ? '#3730a3' :
                                                        adminColor === 'purple' ? '#6b21a8' :
                                                        adminColor === 'pink' ? '#9d174d' :
                                                        adminColor === 'rose' ? '#be123c' :
                                                        adminColor === 'red' ? '#b91c1c' :
                                                        adminColor === 'orange' ? '#c2410c' :
                                                        adminColor === 'amber' ? '#b45309' :
                                                        adminColor === 'yellow' ? '#a16207' :
                                                        adminColor === 'green' ? '#15803d' :
                                                        adminColor === 'emerald' ? '#047857' :
                                                        adminColor === 'teal' ? '#0f766e' :
                                                        adminColor === 'cyan' ? '#0e7490' :
                                                        adminColor === 'sky' ? '#0369a1' :
                                                        '#475569'
                                      }}
                                    >
                                      {adminAvatar}
                                    </div>
                                    <div>
                                        <span className="font-medium block">{adminName || user?.user_metadata?.full_name || user?.email}</span>
                                        <span className="text-xs text-gray-500">{adminName || user?.user_metadata?.full_name || user?.email || 'Daddy'} Dashboard</span>
                                    </div>
                                </button>
                            )}
                            {/* Show siblings from allChildren */}
                            {allChildren.length > 0 && allChildren.filter(c => c.id !== child?.id).map(c => (
                                <button
                                    key={c.id}
                                    onClick={async () => {
                                      // Fetch sibling's full data if we have parent UID
                                      if (parentUid) {
                                        const siblingData = await fetchChildById(parentUid, c.id);
                                        if (siblingData) {
                                          const migratedSibling = migrateChildToTopicStructure(siblingData);
                                          setData([migratedSibling]);
                                          setChildProfile(migratedSibling);
                                        }
                                      }
                                      setView({ type: 'CHILD_DASHBOARD', childId: c.id });
                                      setShowProfileDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-${c.themeColor}-100`}>
                                        {c.avatar}
                                    </div>
                                    <div>
                                        <span className="font-medium block">{c.name}</span>
                                        <span className="text-xs text-gray-500">Switch to</span>
                                    </div>
                                </button>
                            ))}
                            {/* Show for all signed-in users */}
                            {user && (
                                <>
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        {!childProfile && (
                                            <button
                                                onClick={() => { navigate('/manage'); setShowProfileDropdown(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                            >
                                                <Edit2 size={16} />
                                                Manage Profiles
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { signOut?.(); setShowProfileDropdown(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left text-sm"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                  </div>
              </div>
           </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-16 space-y-12 pb-20">
          
          {/* Timeline on Child Dashboard - Show dual schedule for all kids */}
          {isDayActive ? (
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={24} className="text-gray-500" /> Today's Timetable
                  </h2>
                  <button 
                    onClick={() => setIsDayActive(false)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Reset Day
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                      <Timeline 
                        schedule={schedule}
                        childProfiles={data}
                        focusedChildId={undefined}
                        onBlockClick={(cId, sId, tId, lId) => {
                            navigate(`/child/${cId}/subject/${sId}/topic/${tId}/lesson/${lId}`);
                        }}
                    />
                </div>
              </div>
          ) : (
             <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col items-center justify-center text-center gap-6 mb-8">
                 <div className={`p-6 rounded-full bg-${child.themeColor}-50 text-${child.themeColor}-500 mb-2`}>
                    <PlayCircle size={48} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Start School Day</h3>
                    <p className="text-gray-500">Ready to begin your learning adventure?</p>
                 </div>
                 <button 
                    onClick={() => generateSchedule(5)}
                    className={`bg-${child.themeColor}-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-${child.themeColor}-700 hover:scale-105 transition-all flex items-center gap-3`}
                 >
                    <Play size={24} fill="currentColor"/> Let's Go!
                 </button>
             </div>
          )}

           {child.yearGroups.map((yg) => (
             <div key={yg.id}>
               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                 <GraduationCap className={`text-${child.themeColor}-600`} /> {yg.name} Curriculum
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {yg.subjects.map(subject => {
                   const allLessons = subject.topics.flatMap(t => t.lessons);
                   const completedCount = allLessons.filter(l => l.completed && !l.deleted).length;
                   const totalCount = allLessons.filter(l => !l.deleted).length;
                  
                  return (
                    <div 
                      key={subject.id} 
                      className="p-3 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex flex-col justify-between"
                      onClick={() => navigate(`/child/${child.id}/subject/${subject.id}`)}
                    >
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                             <div className={`w-2 h-2 rounded-full ${
                                subject.color.includes('blue') ? 'bg-blue-500' : 
                                subject.color.includes('green') ? 'bg-green-500' : 
                                subject.color.includes('amber') ? 'bg-amber-500' : 
                                subject.color.includes('rose') ? 'bg-rose-500' : 
                                subject.color.includes('indigo') ? 'bg-indigo-500' : 
                                'bg-gray-400'
                             }`}></div>
                             <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1 truncate">{subject.category}</div>
                             {completedCount === totalCount && totalCount > 0 && <CheckCircle size={14} className="text-green-500" />}
                          </div>

                           <div className="font-bold text-gray-800 text-xs mb-3 truncate group-hover:text-blue-600 transition-colors">
                               {subject.topics[0]?.name || subject.name}
                           </div>
                      </div>
                      
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                              <span>{completedCount}/{totalCount} completed</span>
                          </div>
                          <ProgressBar 
                              current={completedCount} 
                              total={totalCount} 
                              colorClass={`bg-${child.themeColor}-500`}
                              heightClass="h-1.5"
                          />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ManageProfilesView = () => {
    const { user, signOut } = useAuth() || {};
    const [isAdding, setIsAdding] = useState(false);
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [editingYearGroups, setEditingYearGroups] = useState<string | null>(null);
    const [editingAdmin, setEditingAdmin] = useState(false);
    
    // Admin edit states
    const [editAdminDob, setEditAdminDob] = useState(adminDob);
    const [editAdminName, setEditAdminName] = useState(adminName);
    const [newAdminAvatar, setNewAdminAvatar] = useState(adminAvatar);
    const [editAdminColor, setEditAdminColor] = useState(adminColor);
    const [adminAvatarPage, setAdminAvatarPage] = useState(0);
    
    // Kid edit states
    const [editName, setEditName] = useState('');
    const [editDob, setEditDob] = useState('');
    const [editGoogleEmail, setEditGoogleEmail] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editColor, setEditColor] = useState('');
    const [avatarPage, setAvatarPage] = useState(0);
    const [newYearGroup, setNewYearGroup] = useState('');

    const AVATARS = ['👶', '🧒', '👦', '👧', '🧑‍🦰', '👱', '🧑', '👨‍🦱', '👩‍🦱', '🧑‍🦳', '👨‍🦳', '👩‍🦳', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '🧔', '👨', '👩', '🧑‍🚀', '👩‍🚀', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨', '🧑‍🏫', '👩‍🏫', '🧑‍⚕️', '👩‍⚕️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭', '🧑‍🚒', '👩‍🚒', '🧑‍✈️', '👩‍✈️', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙', '🧙‍♀️', '🧚', '🧚‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧝', '🧝‍♀️', '🧞', '🧞‍♀️', '🧟', '🧟‍♀️', '👼', '🎅', '🤶', '🦸‍♂️', '🦹‍♂️', '🧙‍♂️', '🧚‍♂️', '🧛‍♂️', '🧜‍♂️', '🧝‍♂️', '🧞‍♂️', '🧟‍♂️'];
    const AVATARS_PER_PAGE = 20;
    const THEME_COLORS = [
      { name: 'Blue', class: 'blue', bg: '#dbeafe', text: '#1e40af' },
      { name: 'Indigo', class: 'indigo', bg: '#e0e7ff', text: '#3730a3' },
      { name: 'Purple', class: 'purple', bg: '#f3e8ff', text: '#6b21a8' },
      { name: 'Pink', class: 'pink', bg: '#fce7f3', text: '#9d174d' },
      { name: 'Rose', class: 'rose', bg: '#ffe4e6', text: '#be123c' },
      { name: 'Red', class: 'red', bg: '#fee2e2', text: '#b91c1c' },
      { name: 'Orange', class: 'orange', bg: '#ffedd5', text: '#c2410c' },
      { name: 'Amber', class: 'amber', bg: '#fef3c7', text: '#b45309' },
      { name: 'Yellow', class: 'yellow', bg: '#fef9c3', text: '#a16207' },
      { name: 'Green', class: 'green', bg: '#dcfce7', text: '#15803d' },
      { name: 'Emerald', class: 'emerald', bg: '#d1fae5', text: '#047857' },
      { name: 'Teal', class: 'teal', bg: '#ccfbf1', text: '#0f766e' },
      { name: 'Cyan', class: 'cyan', bg: '#cffafe', text: '#0e7490' },
      { name: 'Sky', class: 'sky', bg: '#e0f2fe', text: '#0369a1' },
      { name: 'Slate', class: 'slate', bg: '#f1f5f9', text: '#475569' },
    ];

    const handleSaveAdmin = async () => {
      setAdminAvatar(newAdminAvatar);
      setAdminColor(editAdminColor);
      setAdminName(editAdminName);
      setAdminDob(editAdminDob);
      
      if (user?.uid) {
        await saveUserSettings(user.uid, {
          adminDob: editAdminDob,
          adminColor: editAdminColor,
          adminName: editAdminName,
          adminAvatar: newAdminAvatar
        });
      }
      setEditingAdmin(false);
    };

    const handleSaveKid = () => {
      if (!editingChildId || !editName.trim()) return;
      
      setData(prev => {
        const newData = prev.map(child => {
          if (child.id !== editingChildId) return child;
          return { 
            ...child, 
            name: editName.trim(),
            dob: editDob,
            avatar: editAvatar,
            themeColor: editColor,
            googleEmail: editGoogleEmail.trim() || undefined,
          };
        });
        saveData(newData, user);
        return newData;
      });
      
      setEditingChildId(null);
    };

    const startEditingChild = (child: ChildProfile) => {
      setEditingChildId(child.id);
      setEditName(child.name);
      setEditDob(child.dob);
      setEditAvatar(child.avatar);
      setEditColor(child.themeColor);
      setEditGoogleEmail(child.googleEmail || '');
      setAvatarPage(0);
      setIsAdding(false);
    };

    const startAddingChild = () => {
      setIsAdding(true);
      setEditingChildId(null);
      setEditName('');
      setEditDob('');
      setEditGoogleEmail('');
      setEditAvatar('👶');
      setEditColor('blue');
      setAvatarPage(0);
    };

    const handleAddChildLocal = () => {
      if (!editName.trim()) return;
      
      const newChild: ChildProfile = {
        id: crypto.randomUUID(),
        name: editName.trim(),
        dob: editDob,
        avatar: editAvatar,
        themeColor: editColor,
        googleEmail: editGoogleEmail.trim() || undefined,
        yearGroups: [],
      };
      
      setData(prev => {
        const newData = [...prev, newChild];
        saveData(newData, user);
        return newData;
      });
      
      setIsAdding(false);
      setEditName('');
      setEditDob('');
      setEditGoogleEmail('');
    };

    const cancelEdit = () => {
      setIsAdding(false);
      setEditingChildId(null);
    };

    const handleAddYearGroupFromView = (childId: string) => {
      if (newYearGroup.trim()) {
        handleAddYearGroup(childId, newYearGroup.trim());
        setNewYearGroup('');
      }
    };

    const totalPages = Math.ceil(AVATARS.length / AVATARS_PER_PAGE);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => setView({ type: 'HOME' })}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-800">Manage Profiles</h1>
            <div className="w-24"></div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Admin Profile Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Account Owner</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ 
                      backgroundColor: THEME_COLORS.find(c => c.class === editAdminColor)?.bg || '#f3f4f6'
                    }}
                  >
                    {adminAvatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{adminName || user?.user_metadata?.full_name || user?.email || 'Admin'}</h3>
                    <p className="text-sm text-gray-500">Account Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingAdmin(!editingAdmin);
                    setNewAdminAvatar(adminAvatar);
                    setEditAdminColor(adminColor);
                    setEditAdminDob(adminDob);
                    setEditAdminName(adminName);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  {editingAdmin ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Admin Edit Form */}
              {editingAdmin && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                  <div className="pt-4 space-y-4">
                    {/* Avatar Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                      <div className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg border border-gray-200">
                        {AVATARS.slice(adminAvatarPage * AVATARS_PER_PAGE, (adminAvatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                          <button
                            key={a}
                            onClick={() => setNewAdminAvatar(a)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                              newAdminAvatar === a
                                ? 'bg-blue-100 ring-2 ring-blue-500'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-2">
                          <button
                            onClick={() => setAdminAvatarPage(p => Math.max(0, p - 1))}
                            disabled={adminAvatarPage === 0}
                            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600 py-1">
                            {adminAvatarPage + 1} / {totalPages}
                          </span>
                          <button
                            onClick={() => setAdminAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={adminAvatarPage === totalPages - 1}
                            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Theme Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                      <div className="flex flex-wrap gap-2">
                        {THEME_COLORS.map((color) => (
                          <button
                            key={color.class}
                            onClick={() => setEditAdminColor(color.class)}
                            className={`w-10 h-10 rounded-lg transition ${
                              editAdminColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                            style={{ backgroundColor: color.bg }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={editAdminName}
                        onChange={(e) => setEditAdminName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter your name"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sign-in Email</label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        readOnly
                        className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                      />
                    </div>

                    {/* DOB */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                      <input
                        type="date"
                        value={editAdminDob}
                        onChange={(e) => setEditAdminDob(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <button
                      onClick={handleSaveAdmin}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profiles Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Student Profiles</h2>
              <button
                onClick={startAddingChild}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
              >
                <UserPlus size={18} />
                Add Student
              </button>
            </div>

            {/* Add New Student Form */}
            {isAdding && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Student</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter student name"
                    />
                  </div>
                  
                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                    <div className="flex flex-wrap gap-2 justify-center bg-gray-50 p-3 rounded-lg">
                      {AVATARS.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                        <button
                          key={a}
                          onClick={() => setEditAvatar(a)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                            editAvatar === a
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'hover:bg-white'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-2">
                        <button
                          onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                          disabled={avatarPage === 0}
                          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600 py-1">
                          {avatarPage + 1} / {totalPages}
                        </span>
                        <button
                          onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={avatarPage === totalPages - 1}
                          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Theme Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                    <div className="flex flex-wrap gap-2">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color.class}
                          onClick={() => setEditColor(color.class)}
                          className={`w-10 h-10 rounded-lg transition ${
                            editColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                          style={{ backgroundColor: color.bg }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Email (optional - for student login)</label>
                    <input
                      type="email"
                      value={editGoogleEmail}
                      onChange={(e) => setEditGoogleEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="student@gmail.com"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddChildLocal}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Add Student
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {data.map((child, index) => (
                <div 
                  key={child.id}
                  className={`${index !== data.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ 
                          backgroundColor: THEME_COLORS.find(c => c.class === child.themeColor)?.bg || '#f3f4f6'
                        }}
                      >
                        {child.avatar || '👤'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{child.name || 'Student'}</h3>
                        <p className="text-sm text-gray-500">{child.yearGroups.map(yg => yg.name).join(', ') || 'No year groups'}</p>
                        {child.googleEmail && <p className="text-xs text-blue-600 mt-1">🔗 {child.googleEmail}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingYearGroups(editingYearGroups === child.id ? null : child.id)}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        {editingYearGroups === child.id ? 'Hide Year Groups' : 'Manage Year Groups'}
                      </button>
                      <button
                        onClick={() => {
                          if (editingChildId === child.id) {
                            setEditingChildId(null);
                          } else {
                            startEditingChild(child);
                          }
                        }}
                        className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        {editingChildId === child.id ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${child.name || 'this student'}?`)) {
                            handleDeleteChild(child.id);
                          }
                        }}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Kid Edit Form - Expand Below */}
                  {editingChildId === child.id && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Avatar Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                          <div className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg border border-gray-200">
                            {AVATARS.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                              <button
                                key={a}
                                onClick={() => setEditAvatar(a)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                                  editAvatar === a
                                    ? 'bg-blue-100 ring-2 ring-blue-500'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                          {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-2">
                              <button
                                onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                                disabled={avatarPage === 0}
                                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                              >
                                Previous
                              </button>
                              <span className="text-sm text-gray-600 py-1">
                                {avatarPage + 1} / {totalPages}
                              </span>
                              <button
                                onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={avatarPage === totalPages - 1}
                                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Theme Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                          <div className="flex flex-wrap gap-2">
                            {THEME_COLORS.map((color) => (
                              <button
                                key={color.class}
                                onClick={() => setEditColor(color.class)}
                                className={`w-10 h-10 rounded-lg transition ${
                                  editColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                }`}
                                style={{ backgroundColor: color.bg }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                          <input
                            type="date"
                            value={editDob}
                            onChange={(e) => setEditDob(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Google Email (optional - for student login)</label>
                          <input
                            type="email"
                            value={editGoogleEmail}
                            onChange={(e) => setEditGoogleEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="student@gmail.com"
                          />
                        </div>

                        <button
                          onClick={handleSaveKid}
                          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Year Groups Management */}
                  {editingYearGroups === child.id && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="pt-2 space-y-2">
                        {child.yearGroups.map((yg) => (
                          <div key={yg.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                            <span className="font-medium text-gray-700">{yg.name}</span>
                            <button
                              onClick={() => handleRemoveYearGroup(child.id, yg.id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={newYearGroup}
                            onChange={(e) => setNewYearGroup(e.target.value)}
                            placeholder="Add year group (e.g., Year 5)"
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button
                            onClick={() => handleAddYearGroupFromView(child.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => signOut?.()}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- URL Routing ---
  const navigate = useNavigate();
  const urlParams = useParams();
  const initialized = useRef(false);

  // Sync URL to view state on mount only
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const path = window.location.pathname;
    console.log('[Router] Initial URL:', path);

    // Parse URL and set view state
    if (path === '/' || path === '') {
      setView({ type: 'LANDING' });
    } else if (path === '/returning' || path === '/returningview') {
      setView({ type: 'RETURNING' });
    } else if (path === '/dashboard' || path === '/admin' || path === '/admindash') {
      setView({ type: 'HOME' });
    } else if (path === '/curriculum') {
      setView({ type: 'CURRICULUM_BUILDER' });
    } else if (path === '/manage') {
      setView({ type: 'MANAGE_PROFILES' });
    } else if (path.startsWith('/child/') && urlParams.childId) {
      const subjectId = urlParams.subjectId;
      const topicId = urlParams.topicId;
      const lessonId = urlParams.lessonId;

      if (lessonId && topicId && subjectId) {
        setView({ type: 'LESSON_PLAYER', childId: urlParams.childId, subjectId, topicId, lessonId, origin: 'KIDSDASH' });
      } else if (subjectId) {
        setView({ type: 'SUBJECT_DETAIL', childId: urlParams.childId, subjectId, origin: 'KIDSDASH' });
      } else {
        setView({ type: 'CHILD_DASHBOARD', childId: urlParams.childId });
      }
    }
  }, []); // Run once on mount

  // --- Main Render Switch ---

  return (
    <>
    <Routes>
      <Route path="/landingview" element={view.type === 'LANDING' ? <LandingView
        data={data}
        user={user}
        loading={authLoading}
        adminAvatar={adminAvatar}
        adminName={adminName}
        parentEmailInput={parentEmailInput}
        setParentEmailInput={setParentEmailInput}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
        setView={setView}
      /> : <Navigate to="/landingview" replace />} />
      <Route path="/" element={view.type === 'LANDING' ? <LandingView
        data={data}
        user={user}
        loading={authLoading}
        adminAvatar={adminAvatar}
        adminName={adminName}
        parentEmailInput={parentEmailInput}
        setParentEmailInput={setParentEmailInput}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
        setView={setView}
      /> : <Navigate to="/" replace />} />
      <Route path="/returningview" element={view.type === 'RETURNING' ? <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ReturningView childProfile={childProfile} data={data} onNavigate={(nav) => { setView(nav as ViewState); if (nav.type === 'HOME') navigate('/dashboard'); else if (nav.type === 'LANDING') navigate('/'); }} /></Suspense> : <Navigate to="/returningview" replace />} />
      <Route path="/returning" element={view.type === 'RETURNING' ? <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ReturningView childProfile={childProfile} data={data} onNavigate={(nav) => { 
        if (nav.type === 'KIDSDASH') { 
          setView({ type: 'CHILD_DASHBOARD', childId: nav.childId });
          window.location.href = '/kiddash?child=' + nav.childId; 
        } else if (nav.type === 'HOME') { 
          window.location.href = '/dashboard'; 
        } else if (nav.type === 'LANDING') { 
          window.location.href = '/'; 
        } else if (nav.type === 'ADMIN') { 
          window.location.href = '/admindash'; 
        }
      }} /></Suspense> : <Navigate to="/returning" replace />} />
      <Route path="/dashboard" element={<Navigate to="/admindash" replace />} />
      <Route path="/admindash" element={<AdminDash />} />
      <Route path="/lessonview" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><LessonView childId={new URLSearchParams(window.location.search).get('child') || 'sophia'} lessonId={new URLSearchParams(window.location.search).get('lesson') || ''} /></Suspense>} />
      <Route path="/admin" element={<Navigate to="/admindash" replace />} />
      <Route path="/curriculum" element={<Navigate to="/admindash" replace />} />
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

// Simple Icons wrappers for use inside logic without cluttering imports
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;


export default App;