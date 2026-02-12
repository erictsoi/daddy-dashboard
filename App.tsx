import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ViewState, ChildProfile, YearGroup, Subject, Topic, Lesson, ScheduleBlock, ViewOrigin, ParsedRow } from './types';
import { INITIAL_DATA } from './constants';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { supabase } from './src/lib/supabase'
import { fetchChildren, fetchChildByEmail, getLocalData, saveLocalData, updateChildGoogleEmail, saveFullCurriculum, uploadToSupabase, loadFromSupabase, restoreLessonInSupabase, hardDeleteLessonFromSupabase, softDeleteLessonInSupabase, hardDeleteSubjectFromSupabase, migrateChildToTopicStructure } from './src/lib/dataService';
import { usePersistentTimer, formatTime, formatTimeReadable } from './src/lib/useTimer';
import { ProgressBar } from './components/ProgressBar';
import { LessonPlayer } from './components/LessonPlayer';
import { Timeline } from './components/Timeline';
import { CurriculumBuilder } from './components/CurriculumBuilder';

// Export data to JSON file
const exportDataToFile = (data: ChildProfile[], filename: string = 'daddy-dashboard-export.json') => {
  const exportObj = {
    version: 1,
    exportedAt: new Date().toISOString(),
    children: data
  };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function shallowClone(obj: any): any {
  return Array.isArray(obj) ? obj.slice() : { ...obj };
}

function cloneWithPath(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;
  
  const result = shallowClone(obj);
  let current: any = result;
  
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = shallowClone(current[path[i]]);
    current = current[path[i]];
  }
  
  current[path[path.length - 1]] = value;
  return result;
}

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
          // Deduplicate at year group level: each topic only once per subject per year group
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
                    lessons: topic.lessons.filter((lesson, index, self) =>
                      index === self.findIndex((l) => l.id === lesson.id)
                    )
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
  UploadCloud,
  DownloadCloud
} from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth() || {};
  const [view, setView] = useState<ViewState>({ type: 'LANDING' });
  const [data, setData] = useState<ChildProfile[]>([]);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  
  // Admin profile state
  const [adminAvatar, setAdminAvatar] = useState(() => {
    return localStorage.getItem('admin_avatar') || '👨‍🏫';
  });
  const [adminColor, setAdminColor] = useState(() => {
    return localStorage.getItem('admin_color') || 'blue';
  });
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  
  // Supabase status indicator
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

    console.log('Auth loaded, user =', user?.id || 'null');

    // Only skip if we've already loaded data for this user
    if (lastUserIdRef.current === user?.id && data.length > 0) {
      console.log('Already loaded data for this user, skipping');
      return;
    }
    
    // Prevent parallel fetches from React Strict Mode double-rendering
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    lastUserIdRef.current = user?.id || null;
    isFetchingRef.current = true;

    const loadData = async () => {
      setAuthDebug('loadData starting...');
      console.log('loadData: user =', user?.id || 'null');
      console.log('loadData: user email =', user?.email || 'null');
      setAuthDebug('User: ' + (user?.id || 'null') + ', Email: ' + (user?.email || 'null'));

      setLoading(true);
      try {
        if (user) {
          // Check if user is a child by matching email
          try {
            const childData = await fetchChildByEmail(user.email || '');
            if (childData && childData.length > 0) {
              console.log('Found child profile:', childData[0].name);
              setChildProfile(childData[0]);
              setData(childData);
              isFetchingRef.current = false;
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log('Not a child account, checking for admin data');
          }
          
          console.log('Fetching children for userId:', user.id);
          setAuthDebug('Fetching children for: ' + user.id);
          setChildProfile(null);
          const childrenData = await fetchChildren(user.id);
          console.log('Got childrenData:', childrenData.length, 'children');
          setAuthDebug('Found ' + childrenData.length + ' children');
          if (childrenData.length > 0) {
            setData(childrenData);
          } else {
            // No children in Supabase - start fresh (don't sync from localStorage for logged-in users)
            console.log('No children found in Supabase - using empty state');
            setData([]);
          }
        } else {
          console.log('No user, loading localStorage data');
          setChildProfile(null);
          setData(getLocalData());
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



  // --- Child Management Functions ---

  const handleAddChild = (childData: Omit<ChildProfile, 'id' | 'yearGroups'>) => {
    const newChild: ChildProfile = {
      ...childData,
      id: Math.random().toString(36).substr(2, 9),
      yearGroups: [],
    };
    setData(prev => {
      const newData = [...prev, newChild];
      if (user) {
        saveFullCurriculum(newData, user.id).catch(console.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  const handleDeleteChild = (id: string) => {
    setData(prev => {
      const newData = prev.filter(child => child.id !== id);
      if (user) {
        saveFullCurriculum(newData, user.id).catch(console.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  const handleUpdateChild = (id: string, updates: Partial<ChildProfile>) => {
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== id) return child;
        return { ...child, ...updates };
      });
      if (user) {
        saveFullCurriculum(newData, user.id).catch(console.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  const handleUpdateChildProfile = (updates: Partial<ChildProfile>) => {
    if (childProfile) {
      const updated = { ...childProfile, ...updates };
      setChildProfile(updated);
      if (user) {
        const allChildren = data.map(c => c.id === updated.id ? updated : c);
        saveFullCurriculum(allChildren, user.id).catch(console.error);
      }
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
      if (user) {
        saveFullCurriculum(newData, user.id).catch(console.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  const handleRemoveYearGroup = (childId: string, yearGroupId: string) => {
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return { ...child, yearGroups: child.yearGroups.filter(yg => yg.id !== yearGroupId) };
      });
      if (user) {
        saveFullCurriculum(newData, user.id).catch(console.error);
      } else {
        saveLocalData(newData);
      }
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
  
      // Pre-shuffle subjects for each child
      const childSubjects: Record<string, { subjects: any[], topics: any[], subjectIndex: number, topicIndex: number }> = {};
      allChildren.forEach(child => {
        const subjects = shuffle(child.yearGroups.flatMap(yg => yg.subjects));
        // Flatten all topics from all subjects into a single list
        const allTopics = subjects.flatMap((s: any) => s.topics.map((t: any) => ({ ...t, subjectId: s.id, subjectName: s.name, subjectColor: s.color })));
        childSubjects[child.id] = { subjects, topics: allTopics, subjectIndex: 0, topicIndex: 0 };
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
                    lessons: topic.lessons.map(l => l.id === lessonId ? { ...l, completed: true, timeSpentSeconds } : l)
                  };
                })
              };
            })
          }))
        };
      });
      if (user) {
        saveFullCurriculum(newData, user.id).catch(console.error);
      } else {
        saveLocalData(newData);
      }
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

      // Add new lesson
      const newLesson: Lesson = {
        id: `${topic.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
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
    
    if (user) {
      saveFullCurriculum(newData, user.id)
        .then(() => {
          console.log('handleBulkImport: Saved to Supabase');
          (window as any).__handleBulkImportRunning = false;
        })
        .catch(err => {
          console.error('handleBulkImport: Error saving to Supabase:', err);
          (window as any).__handleBulkImportRunning = false;
        });
    } else {
      saveLocalData(newData);
      console.log('handleBulkImport: Saved to localStorage');
      (window as any).__handleBulkImportRunning = false;
    }
    
    setView({ type: 'HOME' });
  };

  const handleDeleteSubject = async (childId: string, subjectId: string) => {
      const scrollY = window.scrollY;

      if (user) {
        await hardDeleteSubjectFromSupabase(subjectId).catch(err => {
          console.error('Failed to delete subject from Supabase:', err);
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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
  };

  const handleRestoreLesson = async (childId: string, subjectId: string, topicId: string, lessonId: string) => {
      if (user) {
        await restoreLessonInSupabase(lessonId).catch(err => {
          console.error('Failed to restore lesson in Supabase:', err);
        });
      }

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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
  };

  const handleHardDeleteLesson = (childId: string, subjectId: string, topicId: string, lessonId: string) => {
      console.log('Deleting lesson:', lessonId, 'from topic:', topicId);
      
      if (!lessonId) {
        console.error('Cannot delete: lessonId is undefined');
        return;
      }

      if (user) {
        hardDeleteLessonFromSupabase(lessonId).catch(err => {
          console.error('Failed to hard delete lesson in Supabase:', err);
        });
      }

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
        
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        
        return newData;
      });
  };

  const handleSoftDeleteLesson = (childId: string, subjectId: string, topicId: string, lessonId: string) => {
      if (user) {
        softDeleteLessonInSupabase(lessonId).catch(err => {
          console.error('Failed to soft delete lesson in Supabase:', err);
        });
      }

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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
  };

  // --- Components for Views ---

  const LandingView = () => {
    const { user, signInWithGoogle, signOut, loading } = useAuth() || {};

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
            onClick={() => setView({ type: 'CHILD_DASHBOARD', childId: childProfile.id })}
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
                  <h1 className="text-4xl font-bold text-gray-800">HK Homeschool Hub</h1>
                  <p className="text-xl text-gray-500">Who is learning today?</p>
              </div>
              {user ? (
                <ProfileSwitcher
                  user={user}
                  data={data}
                  adminAvatar={adminAvatar}
                  adminColor={adminColor}
                  adminName={user?.user_metadata?.full_name || user?.email || 'Admin'}
                  onSignOut={() => signOut?.()}
                  onManageProfiles={() => setView({ type: 'MANAGE_PROFILES' })}
                  onSwitchProfile={(childId) => setView({ type: 'CHILD_DASHBOARD', childId })}
                  onGoToLanding={() => setView({ type: 'LANDING' })}
                  onGoToAdmin={() => setView({ type: 'HOME' })}
                />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl mx-auto">
              {/* Daddy Card */}
              <div className="relative group">
                <button 
                    onClick={() => setView({ type: 'HOME' })}
                    className="w-full bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300 flex flex-col items-center gap-6 border border-gray-100 group"
                >
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-6xl group-hover:bg-gray-200 transition">
                        {adminAvatar}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Daddy</h2>
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
                  <div key={child.id} className="relative group">
                    <button 
                        onClick={() => setView({ type: 'CHILD_DASHBOARD', childId: child.id })}
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
              <p className="text-gray-500 text-sm">
                You're viewing the demo mode. Sign in with Google to save your custom curriculum data.
              </p>
             </div>
           )}

            {/* Admin Utilities - Data Management */}
            {user && data.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 max-w-5xl mx-auto w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Data Management</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => exportDataToFile(data)}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition flex items-center gap-2"
                  >
                    <DownloadCloud size={16} />
                    Export Curriculum
                  </button>
                  <button
                    onClick={() => importFileInputRef?.click()}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition flex items-center gap-2"
                  >
                    <UploadCloud size={16} />
                    Import Curriculum
                  </button>
                  <button
                    onClick={async () => {
                      const { data: subjects, error } = await supabase?.from('subjects').select('id, name').order('name');
                      if (error) {
                        showStatus('Error: ' + error.message, 'error');
                        return;
                      }
                      const nameCounts: Record<string, number> = {};
                      subjects?.forEach(s => {
                        nameCounts[s.name] = (nameCounts[s.name] || 0) + 1;
                      });
                      const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
                      if (duplicates.length > 0) {
                        showStatus(`${subjects?.length || 0} subjects, ${duplicates.length} duplicates found`, 'error');
                      } else {
                        showStatus(`${subjects?.length || 0} subjects, no duplicates`, 'success');
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <Book size={16} />
                    Check Subjects
                  </button>
                </div>
                <input
                  type="file"
                  accept=".json"
                  ref={(el) => { importFileInputRef = el; }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const importedData = await importDataFromFile(file);
                      if (user) {
                        await saveFullCurriculum(importedData, user.id);
                        showStatus('Imported and saved to Supabase!', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        saveLocalData(importedData);
                        showStatus('Imported to localStorage!', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      }
                    } catch (err) {
                      showStatus('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
    }, [childId, subjectId, user]);

    const handleDeleteTopic = (topicId: string) => {
      if (!confirm('Delete this topic and all its lessons?')) return;
      
      // Delete from Supabase if exists
      if (user) {
        hardDeleteSubjectFromSupabase(topicId).catch(err => {
          console.error('Failed to delete topic from Supabase:', err);
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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
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
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
      setEditingTopic(null);
    };

    if (!child || !subject) return <div>Subject not found</div>;

    return (
        <div className="min-h-screen bg-white">
            <header className={`bg-${child.themeColor}-600 text-white p-6 sticky top-0 z-10 shadow-md`}>
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => {
                        if (origin === 'HOME') {
                            setView({ type: 'HOME' });
                        } else {
                            setView({ type: 'CHILD_DASHBOARD', childId });
                        }
                    }} className="flex items-center gap-2 hover:opacity-80 mb-4 transition">
                        <ArrowLeft size={20}/> Back to {isReadOnly ? `${child.name}'s Space` : 'Daddy Dashboard'}
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
                                    {user && (
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
                                                <span className="font-medium block">{user.user_metadata?.full_name || user.email}</span>
                                                <span className="text-xs text-gray-500">Daddy Dashboard</span>
                                            </div>
                                        </button>
                                    )}
                                    {data.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setView({ type: 'CHILD_DASHBOARD', childId: c.id }); setShowProfileDropdown(false); }}
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
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={() => { setView({ type: 'MANAGE_PROFILES' }); setShowProfileDropdown(false); }}
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
                                      autoFocus
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
                                                  autoFocus
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
                                              autoFocus
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

    const DaddyDashboardView = () => {
    // Restore scroll position on mount
    useEffect(() => {
        window.scrollTo(0, scrollYRef.current);
    }, []);

    const handleNavigate = (newView: ViewState) => {
        scrollYRef.current = window.scrollY;
        setView(newView);
    };

    const { user, signOut } = useAuth() || {};
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Bulk selection state for subjects
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [editingSubject, setEditingSubject] = useState<{ subjectId: string; category: string; topicName: string } | null>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
          setShowProfileDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSubjectSelection = (cardId: string) => {
      const newSelected = new Set(selectedSubjects);
      if (newSelected.has(cardId)) {
        newSelected.delete(cardId);
      } else {
        newSelected.add(cardId);
      }
      setSelectedSubjects(newSelected);
      setShowBulkActions(newSelected.size > 0);
    };

    const selectAllSubjects = () => {
      const allIds = new Set<string>();
      data.forEach(child => {
        child.yearGroups.forEach(yg => {
          yg.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
              allIds.add(`${subject.id}-${topic.id}`);
            });
          });
        });
      });
      setSelectedSubjects(allIds);
      setShowBulkActions(true);
    };

    const clearSelection = () => {
      setSelectedSubjects(new Set());
      setShowBulkActions(false);
    };

    const handleBulkDeleteSubjects = async () => {
      if (!confirm(`Delete ${selectedSubjects.size} topics? This cannot be undone.`)) return;

      // Delete from Supabase first
      for (const cardId of selectedSubjects) {
        // Extract topic id from cardId (format: subjectId-topicId)
        const topicId = cardId.split('-').slice(-1)[0];
        if (topicId) {
          // We need to find the actual topic to get its id
          for (const child of data) {
            for (const yg of child.yearGroups) {
              for (const subject of yg.subjects) {
                const topic = subject.topics.find(t => `${subject.id}-${t.id}` === cardId);
                if (topic) {
                  await hardDeleteSubjectFromSupabase(topic.id).catch(err => {
                    console.error('Failed to delete topic from Supabase:', err);
                  });
                }
              }
            }
          }
        }
      }

      // Then update local state
      setData(prev => {
        const newData = prev.map(child => ({
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(subject => ({
              ...subject,
              topics: subject.topics.filter(topic => !selectedSubjects.has(`${subject.id}-${topic.id}`))
            }))
          }))
        }));
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        }
        return newData;
      });

      clearSelection();
    };

    const handleStartEditSubject = (subject: any) => {
      setEditingSubject({
        subjectId: subject.id,
        category: subject.category,
        topicName: subject.topics[0]?.name || ''
      });
    };

    const handleSaveSubject = () => {
      if (!editingSubject) return;
      setData(prev => {
        const newData = prev.map(child => ({
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.map(s => {
              if (s.id !== editingSubject.subjectId) return s;
              return {
                ...s,
                category: editingSubject.category,
                topics: s.topics.map(t => ({
                  ...t,
                  name: editingSubject.topicName || t.name
                }))
              };
            })
          }))
        }));
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
      setEditingSubject(null);
    };

    const handleDeleteTopicAtPath = (childId: string, subjectId: string, topicId: string) => {
      if (!confirm('Delete this topic and all its lessons?')) return;
      
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
                if (updatedTopics.length === 0) {
                  return null;
                }
                return {
                  ...s,
                  topics: updatedTopics
                };
              }).filter(Boolean)
            }))
          };
        });
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
    };

    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daddy Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">HK Homeschool Relocation Plan</p>
            </div>
            
            {/* Supabase Status Indicator */}
            {supabaseStatus && (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                supabaseStatus.type === 'success' ? 'bg-green-100 text-green-700' :
                supabaseStatus.type === 'error' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {supabaseStatus.type === 'success' && <CheckCircle size={16} />}
                {supabaseStatus.type === 'error' && <XCircle size={16} />}
                {supabaseStatus.type === 'info' && <Clock size={16} />}
                {supabaseStatus.message}
              </div>
            )}
            
            {/* Auth Debug */}
            {authDebug && (
              <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                {authDebug}
              </div>
            )}
            
            <div className="flex gap-3 items-center">
                <button 
                    onClick={() => handleNavigate({ type: 'CURRICULUM_BUILDER' })}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
                >
                    <Sparkles size={16} /> Build Curriculum
                </button>
                {user && (
                  <>
                    <button 
                        onClick={async () => {
                          const result = await uploadToSupabase(user.id, data);
                          showStatus(result.message, result.success ? 'success' : 'error');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
                        title="Upload current data to Supabase"
                    >
                        <UploadCloud size={16} /> Upload
                    </button>
                    <button 
                        onClick={async () => {
                          const result = await loadFromSupabase(user.id);
                          if (result.success && result.data) {
                            setData(result.data);
                            saveLocalData(result.data);
                            showStatus(result.message, 'success');
                          } else {
                            showStatus(result.message, 'error');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow-lg"
                        title="Load data from Supabase"
                    >
                        <DownloadCloud size={16} /> Load
                    </button>
                    <div className="relative" ref={profileDropdownRef}>
                      <button 
                          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
                      >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{ 
                              backgroundColor: adminColor === 'blue' ? '#dbeafe' : 
                                              adminColor === 'indigo' ? '#e0e7ff' :
                                              adminColor === 'purple' ? '#f3e8ff' :
                                              adminColor === 'pink' ? '#fce7f3' :
                                              adminColor === 'rose' ? '#ffe4e6' :
                                              adminColor === 'red' ? '#fee2e2' :
                                              adminColor === 'orange' ? '#ffedd5' :
                                              adminColor === 'amber' ? '#fef3c7' :
                                              adminColor === 'yellow' ? '#fef9c3' :
                                              adminColor === 'green' ? '#dcfce7' :
                                              adminColor === 'emerald' ? '#d1fae5' :
                                              adminColor === 'teal' ? '#ccfbf1' :
                                              adminColor === 'cyan' ? '#cffafe' :
                                              adminColor === 'sky' ? '#e0f2fe' :
                                              '#f1f5f9'
                            }}
                          >
                            {adminAvatar}
                          </div>
                          <span className="font-medium text-gray-700 hidden sm:block">{user?.user_metadata?.full_name || user?.email}</span>
                          <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                      </button>
                      {showProfileDropdown && (
                          <div className="absolute right-0 top-full mt-2 w-72 bg-white text-gray-800 rounded-lg shadow-2xl py-2 z-50 border border-gray-200">
                              <div className="px-3 py-2 border-b border-gray-100">
                                  <p className="font-medium text-sm text-gray-500">Switch Profile</p>
                              </div>
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
                                      <span className="font-medium block">{user?.user_metadata?.full_name || user?.email || 'Daddy'}</span>
                                      <span className="text-xs text-gray-500">Daddy Dashboard</span>
                                  </div>
                              </button>
                              {data.map(c => (
                                  <button
                                      key={c.id}
                                      onClick={() => { setView({ type: 'CHILD_DASHBOARD', childId: c.id }); setShowProfileDropdown(false); }}
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
                              <div className="border-t border-gray-100 mt-2 pt-2">
                                  <button
                                      onClick={() => { /* TODO: Account page */ }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                  >
                                      <User size={16} />
                                      Account
                                  </button>
                                  <button
                                      onClick={() => { setView({ type: 'MANAGE_PROFILES' }); setShowProfileDropdown(false); }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition text-left text-sm"
                                  >
                                      <Edit2 size={16} />
                                      Manage Profiles
                                  </button>
                                  <button
                                      onClick={() => { signOut?.(); setShowProfileDropdown(false); }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left text-sm"
                                  >
                                      <LogOut size={16} />
                                      Sign Out
                                  </button>
                              </div>
                          </div>
                      )}
                    </div>
                  </>
                )}
                <button
                  onClick={() => {
                    if (confirm('Clear all local data? This cannot be undone.')) {
                      localStorage.removeItem('daddy_dashboard_data');
                      localStorage.removeItem('admin_avatar');
                      localStorage.removeItem('admin_color');
                      window.location.reload();
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                  title="Clear local storage"
                >
                  🗑️ Clear Data
                </button>
                {user && (
                  <>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete duplicate children from Supabase? Only one per name will be kept.')) return;
                        
                        showStatus('Finding duplicates...', 'info');
                        try {
                          const { data: children } = await supabase
                            .from('children')
                            .select('id, name')
                            .eq('user_id', user.id);
                          
                          if (!children || children.length === 0) {
                            showStatus('No children found', 'error');
                            return;
                          }
                          
                          const nameCount: Record<string, string[]> = {};
                          children.forEach(c => {
                            if (!nameCount[c.name]) nameCount[c.name] = [];
                            nameCount[c.name].push(c.id);
                          });
                          
                          const duplicates: string[] = [];
                          Object.values(nameCount).forEach(ids => {
                            if (ids.length > 1) duplicates.push(...ids.slice(1));
                          });
                          
                          if (duplicates.length === 0) {
                            showStatus('No duplicates found!', 'success');
                            return;
                          }
                          
                          if (!confirm(`Found ${duplicates.length} duplicates. Delete them?`)) return;
                          
                          showStatus('Deleting duplicates...', 'info');
                          for (const childId of duplicates) {
                            const { data: ygs } = await supabase.from('year_groups').select('id').eq('child_id', childId);
                            if (ygs) {
                              const ygIds = ygs.map(y => y.id);
                              const { data: subs } = await supabase.from('subjects').select('id').in('year_group_id', ygIds);
                              if (subs) {
                                const subIds = subs.map(s => s.id);
                                const { data: tops } = await supabase.from('topics').select('id').in('subject_id', subIds);
                                if (tops) await supabase.from('lessons').delete().in('topic_id', tops.map(t => t.id));
                                await supabase.from('topics').delete().in('subject_id', subIds);
                              }
                              await supabase.from('subjects').delete().in('year_group_id', ygIds);
                            }
                            await supabase.from('year_groups').delete().eq('child_id', childId);
                          }
                          await supabase.from('children').delete().in('id', duplicates);
                          
                          showStatus(`Deleted ${duplicates.length} duplicates! Reloading...`, 'success');
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (e) {
                          showStatus('Error: ' + e, 'error');
                        }
                      }}
                      className="text-amber-600 hover:text-amber-800 text-sm px-2 py-1"
                      title="Delete duplicate children"
                    >
                      🔄 Deduplicate
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('DELETE ALL DATA FROM SUPABASE? This cannot be undone!')) return;
                        if (!confirm('Are you absolutely sure?')) return;
                        
                        showStatus('Deleting all Supabase data...', 'info');
                        try {
                          await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                          await supabase.from('topics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                          await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                          await supabase.from('year_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                          await supabase.from('children').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                          showStatus('Supabase wiped! Refresh page.', 'success');
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (e) {
                          showStatus('Error: ' + e, 'error');
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                      title="Delete all Supabase data"
                    >
                      💥 Nuke Supabase
                    </button>
                    <button
                      onClick={() => {
                        let removed = 0;
                        setData(prev => {
                          const newData = prev.map(child => ({
                            ...child,
                            yearGroups: child.yearGroups.map(yg => ({
                              ...yg,
                              subjects: yg.subjects.map(sub => ({
                                ...sub,
                                topics: sub.topics.map(topic => {
                                  const urlCount: Record<string, string[]> = {};
                                  topic.lessons.forEach(l => {
                                    if (l.videoUrl && !l.deleted) {
                                      if (!urlCount[l.videoUrl]) urlCount[l.videoUrl] = [];
                                      urlCount[l.videoUrl].push(l.id);
                                    }
                                  });
                                  
                                  Object.values(urlCount).forEach(ids => {
                                    if (ids.length > 1) {
                                      removed += ids.length - 1;
                                    }
                                  });
                                  
                                  return {
                                    ...topic,
                                    lessons: topic.lessons.filter(l => {
                                      if (l.deleted) return false;
                                      const url = l.videoUrl;
                                      if (!url) return true;
                                      const ids = urlCount[url];
                                      if (!ids || ids.length === 1) return true;
                                      const keep = ids[0] === l.id;
                                      if (!keep) removed++;
                                      return keep;
                                    })
                                  };
                                })
                              }))
                            }))
                          }));
                          if (user) {
                            saveFullCurriculum(newData, user.id).catch(console.error);
                          } else {
                            saveLocalData(newData);
                          }
                          return newData;
                        });
                        alert(`Removed ${removed} duplicate lessons!`);
                      }}
                      className="text-amber-600 hover:text-amber-800 text-sm px-2 py-1"
                      title="Remove duplicate lessons by video URL"
                    >
                      🎬 Dedupe Lessons
                    </button>
                    <button
                      onClick={async () => {
                        if (!user) {
                          alert('Sign in first');
                          return;
                        }
                        if (!confirm('Clean up ALL duplicate rows in Supabase? This cannot be undone.')) return;
                        
                        showStatus('Cleaning duplicates...', 'info');
                        try {
                          // Clean lessons
                          const { data: lessons } = await supabase.from('lessons').select('id, topic_id, video_url, title');
                          if (lessons) {
                            const urlCount: Record<string, string[]> = {};
                            lessons.forEach(l => {
                              if (l.video_url) {
                                if (!urlCount[l.video_url]) urlCount[l.video_url] = [];
                                urlCount[l.video_url].push(l.id);
                              }
                            });
                            const toDelete: string[] = [];
                            Object.values(urlCount).forEach(ids => {
                              if (ids.length > 1) toDelete.push(...ids.slice(1));
                            });
                            if (toDelete.length > 0) {
                              await supabase.from('lessons').delete().in('id', toDelete);
                              console.log('Deleted', toDelete.length, 'duplicate lessons');
                            }
                          }
                          
                          // Clean topics
                          const { data: topics } = await supabase.from('topics').select('id, subject_id, name');
                          if (topics) {
                            const nameCount: Record<string, string[]> = {};
                            topics.forEach(t => {
                              const key = `${t.subject_id}::${t.name}`;
                              if (!nameCount[key]) nameCount[key] = [];
                              nameCount[key].push(t.id);
                            });
                            const toDelete: string[] = [];
                            Object.values(nameCount).forEach(ids => {
                              if (ids.length > 1) toDelete.push(...ids.slice(1));
                            });
                            if (toDelete.length > 0) {
                              await supabase.from('topics').delete().in('id', toDelete);
                              console.log('Deleted', toDelete.length, 'duplicate topics');
                            }
                          }
                          
                          // Clean subjects
                          const { data: subjects } = await supabase.from('subjects').select('id, year_group_id, name, category');
                          if (subjects) {
                            const nameCount: Record<string, string[]> = {};
                            subjects.forEach(s => {
                              const key = `${s.year_group_id}::${s.name}::${s.category}`;
                              if (!nameCount[key]) nameCount[key] = [];
                              nameCount[key].push(s.id);
                            });
                            const toDelete: string[] = [];
                            Object.values(nameCount).forEach(ids => {
                              if (ids.length > 1) toDelete.push(...ids.slice(1));
                            });
                            if (toDelete.length > 0) {
                              await supabase.from('subjects').delete().in('id', toDelete);
                              console.log('Deleted', toDelete.length, 'duplicate subjects');
                            }
                          }
                          
                          // Clean year_groups
                          const { data: ygs } = await supabase.from('year_groups').select('id, child_id, name');
                          if (ygs) {
                            const nameCount: Record<string, string[]> = {};
                            ygs.forEach(y => {
                              const key = `${y.child_id}::${y.name}`;
                              if (!nameCount[key]) nameCount[key] = [];
                              nameCount[key].push(y.id);
                            });
                            const toDelete: string[] = [];
                            Object.values(nameCount).forEach(ids => {
                              if (ids.length > 1) toDelete.push(...ids.slice(1));
                            });
                            if (toDelete.length > 0) {
                              await supabase.from('year_groups').delete().in('id', toDelete);
                              console.log('Deleted', toDelete.length, 'duplicate year_groups');
                            }
                          }
                          
                          showStatus('Duplicates cleaned! Reloading...', 'success');
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (e) {
                          showStatus('Error: ' + e, 'error');
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                      title="Clean up duplicate rows in Supabase"
                    >
                      🧹 Clean DB
                    </button>
                    
                    {/* Export/Import Section */}
                    <button
                      onClick={() => exportDataToFile(data, `daddy-dashboard-${new Date().toISOString().split('T')[0]}.json`)}
                      className="text-green-600 hover:text-green-800 text-sm px-2 py-1"
                      title="Export curriculum to JSON file"
                    >
                      📤 Export
                    </button>
                    
                    <input
                      type="file"
                      accept=".json"
                      id="import-file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const importedData = await importDataFromFile(file);
                          setData(importedData);
                          if (user) {
                            saveFullCurriculum(importedData, user.id)
                              .then(() => showStatus('Import successful!', 'success'))
                              .catch(err => console.error(err));
                          } else {
                            saveLocalData(importedData);
                            showStatus('Import successful!', 'success');
                          }
                        } catch (err) {
                          showStatus('Import failed: ' + err, 'error');
                        }
                        e.target.value = ''; // Reset
                      }}
                    />
                    <label
                      htmlFor="import-file"
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 cursor-pointer"
                      title="Import curriculum from JSON file"
                    >
                      📥 Import
                    </label>
                  </>
                )}
              </div>
            </div>
          </header>

        <div className="max-w-6xl mx-auto p-6 space-y-12">
            {/* Daily Schedule Section */}
            {!isDayActive ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           <BarChart3 className="text-blue-600" size={20}/> Previous Session Summary
                        </h2>
                        <span className="text-sm text-gray-500 font-medium">Yesterday</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        {data.map(child => {
                           const recentSubjects = child.yearGroups
                             .flatMap(yg => yg.subjects)
                             .filter(s => s.topics.flatMap(t => t.lessons).some(l => !l.deleted))
                             .slice(0, 4);

                           return (
                             <div key={child.id} className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                   <div className="text-3xl bg-gray-100 p-2 rounded-xl">{child.avatar}</div>
                                   <div>
                                      <div className="font-bold text-gray-900 text-lg">{child.name}</div>
                                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                         {child.yearGroups[0]?.name}
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                   {recentSubjects.map(sub => {
                                      const allLessons = sub.topics.flatMap(t => t.lessons);
                                      const activeTotal = allLessons.filter(l => !l.deleted).length;
                                      const activeCompleted = allLessons.filter(l => l.completed && !l.deleted).length;
                                      return (
                                          <div key={sub.id} className="p-3 rounded-xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition cursor-default">
                                             <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${sub.color.includes('blue') ? 'bg-blue-500' : sub.color.includes('green') ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                <div className="text-xs font-bold text-gray-700 truncate w-full">{sub.category}</div>
                                             </div>
                                             <div className="text-[11px] text-gray-500 truncate mb-3 leading-tight min-h-[1.5em]">
                                                {sub.name}
                                             </div>
                                             <ProgressBar 
                                                current={activeCompleted || 1} 
                                                total={activeTotal || 5} 
                                                heightClass="h-1.5"
                                                colorClass={sub.color.includes('blue') ? 'bg-blue-500' : sub.color.includes('green') ? 'bg-green-500' : 'bg-amber-500'}
                                             />
                                          </div>
                                      );
                                   })}
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                  <span>Time Studied</span>
                                  <span className="font-bold text-gray-800">4h 15m</span>
                                </div>
                             </div>
                           );
                        })}
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col items-center">
                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                            <button 
                                onClick={() => generateSchedule(5)} 
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition flex items-center justify-center gap-3 text-lg"
                            >
                               <Play size={24} fill="currentColor" /> Start Today's Session
                            </button>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                               <button onClick={() => generateSchedule(4)} className="hover:text-gray-800 hover:underline">Light (4h)</button>
                               <span className="text-gray-300">•</span>
                               <span className="font-medium text-gray-800">Standard (5h)</span>
                               <span className="text-gray-300">•</span>
                               <button onClick={() => generateSchedule(6)} className="hover:text-gray-800 hover:underline">Long (6h)</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                     <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <Calendar className="text-gray-500" /> Today's Timetable
                          </h2>
                          <button 
                            onClick={() => { setIsDayActive(false); setSchedule([]); }}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                             Reset Day
                          </button>
                     </div>
                      <Timeline 
                          schedule={schedule}
                          childProfiles={data}
                          onBlockClick={(childId, subjectId, topicId, lessonId) => {
                              handleNavigate({ type: 'LESSON_PLAYER', childId, subjectId, topicId, lessonId, origin: 'HOME' });
                          }}
                      />
                 </div>
            )}

            {/* Main Curriculum Hierarchy */}
            <div className="space-y-12">
              {data.map(child => (
                  <div key={child.id} className={`bg-white rounded-3xl border-l-[16px] shadow-lg p-8 border-${child.themeColor}-500`}>
                      {/* Child Header */}
                      <div className="flex items-center gap-5 mb-8 border-b-2 border-gray-100 pb-6">
                          <div className="text-6xl bg-gray-50 shadow-sm p-4 rounded-2xl">{child.avatar}</div>
                          <div>
                              <h2 className="text-4xl font-bold text-gray-900">{child.name}</h2>
                              <p className={`text-${child.themeColor}-600 font-bold mt-1 uppercase tracking-wide`}>Homeschool Track</p>
                          </div>
                          <div className="ml-auto flex items-center gap-3">
                              <button 
                                onClick={() => handleNavigate({ type: 'CHILD_DASHBOARD', childId: child.id })}
                                className={`px-5 py-2 rounded-lg bg-gray-50 text-${child.themeColor}-700 font-semibold hover:bg-${child.themeColor}-50 transition flex items-center gap-2 text-sm shadow-sm border border-gray-200`}
                              >
                                View Dashboard <ChevronRight size={16} />
                              </button>
                              {/* Bulk Select Toggle */}
                              {child.yearGroups.flatMap(yg => yg.subjects).length > 0 && (
                                <button
                                  onClick={() => showBulkActions ? clearSelection() : setShowBulkActions(true)}
                                  className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm shadow-sm border ${
                                    showBulkActions 
                                      ? 'bg-blue-100 text-blue-700 border-blue-300' 
                                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {showBulkActions ? 'Done' : 'Select Subjects'}
                                </button>
                              )}
                          </div>
                      </div>

                      {/* Bulk Actions Toolbar */}
                      {showBulkActions && selectedSubjects.size > 0 && (
                        <div className="flex items-center gap-4 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-xl">
                          <span className="text-sm font-medium text-blue-700">
                            {selectedSubjects.size} selected
                          </span>
                          <button
                            onClick={selectAllSubjects}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Select All
                          </button>
                          <button
                            onClick={clearSelection}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                          <div className="flex-1" />
                          <button
                            onClick={handleBulkDeleteSubjects}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete Selected
                          </button>
                        </div>
                      )}

                       {/* Year Groups */}
                       <div className="space-y-12 pl-2">
                           {child.yearGroups.map(yg => {
                               const ygTotal = yg.subjects.reduce((acc, s) => acc + s.topics.flatMap(t => t.lessons).filter(l=>!l.deleted).length, 0);
                               const ygCompleted = yg.subjects.reduce((acc, s) => acc + s.topics.flatMap(t => t.lessons).filter(l => l.completed && !l.deleted).length, 0);
                               const percent = ygTotal > 0 ? Math.round((ygCompleted / ygTotal) * 100) : 0;

                               return (
                                   <div key={yg.id} className="relative">
                                       {/* Vertical Line Connector */}
                                       <div className="absolute left-[-24px] top-12 bottom-0 w-1 bg-gray-200 rounded-full hidden lg:block"></div>

                                       {/* Year Group Header & Progress */}
                                       <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                           <div className="flex items-center gap-3">
                                               <div className={`w-10 h-10 rounded-full bg-white text-${child.themeColor}-600 flex items-center justify-center font-bold shadow-sm border border-${child.themeColor}-200`}>
                                                   {yg.name.replace(/[^0-9]/g, '')}
                                               </div>
                                               <h3 className="text-2xl font-bold text-gray-800">{yg.name}</h3>
                                           </div>
                                           
                                           {/* Compact Progress Bar for Year */}
                                           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 md:ml-4">
                                               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Curriculum Progress</span>
                                               <div className="w-24">
                                                 <ProgressBar current={ygCompleted} total={ygTotal} heightClass="h-2" colorClass={`bg-${child.themeColor}-500`} />
                                               </div>
                                               <span className={`text-sm font-bold text-${child.themeColor}-600`}>{percent}%</span>
                                           </div>
                                       </div>

                                        {/* 4-Column Grid of Mini Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {yg.subjects.flatMap(subject => 
                                              subject.topics.map(topic => {
                                                const topicLessons = topic.lessons.filter(l => !l.deleted);
                                                const topicCompleted = topicLessons.filter(l => l.completed).length;
                                                const topicTotal = topicLessons.length;
                                                const cardId = `${subject.id}-${topic.id}`;
                                                const isSelected = selectedSubjects.has(cardId);
                                                const isEditing = editingSubject?.subjectId === cardId;

                                                return (
                                                    <div 
                                                        key={cardId}
                                                        onClick={() => showBulkActions ? toggleSubjectSelection(cardId) : handleNavigate({ type: 'SUBJECT_DETAIL', childId: child.id, subjectId: subject.id, origin: 'HOME' })}
                                                        className={`relative p-3 rounded-xl border shadow-sm bg-white hover:shadow-md transition cursor-pointer group flex flex-col justify-between ${
                                                          isSelected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {showBulkActions && (
                                                          <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center z-10 ${
                                                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                                                          }`}>
                                                            {isSelected && <CheckCircle size={14} className="text-white" />}
                                                          </div>
                                                        )}

                                                        {isEditing ? (
                                                          <div className="space-y-2">
                                                            <input
                                                              type="text"
                                                              autoFocus
                                                              value={editingSubject.category}
                                                              onChange={(e) => setEditingSubject({ ...editingSubject, category: e.target.value })}
                                                              onClick={(e) => e.stopPropagation()}
                                                              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                              placeholder="Category (English, Maths, etc.)"
                                                            />
                                                            <input
                                                              type="text"
                                                              value={editingSubject.topicName}
                                                              onChange={(e) => setEditingSubject({ ...editingSubject, topicName: e.target.value })}
                                                              onClick={(e) => e.stopPropagation()}
                                                              className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                              placeholder="Topic name"
                                                            />
                                                            <div className="flex gap-2">
                                                              <button
                                                                onClick={(e) => { e.stopPropagation(); handleSaveSubject(); }}
                                                                className="flex-1 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-700"
                                                              >
                                                                Save
                                                              </button>
                                                              <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingSubject(null); }}
                                                                className="px-2 py-1 text-gray-500 text-xs hover:text-gray-700"
                                                              >
                                                                Cancel
                                                              </button>
                                                            </div>
                                                          </div>
                                                        ) : (
                                                          <>
                                                            <div className="flex items-center gap-2 mb-2 pr-6">
                                                               <div className={`w-2 h-2 rounded-full ${
                                                                  subject.color.includes('blue') ? 'bg-blue-500' : 
                                                                  subject.color.includes('green') ? 'bg-green-500' : 
                                                                  subject.color.includes('amber') ? 'bg-amber-500' : 
                                                                  subject.color.includes('rose') ? 'bg-rose-500' : 
                                                                  subject.color.includes('indigo') ? 'bg-indigo-500' : 
                                                                  'bg-gray-400'
                                                               }`}></div>
                                                               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1 truncate">{subject.category}</div>
                                                               {topicCompleted === topicTotal && topicTotal > 0 && <CheckCircle size={14} className="text-green-500" />}
                                                            </div>
                                                            
                                                            {!showBulkActions && (
                                                              <button
                                                                  onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      handleStartEditSubject({ ...subject, id: cardId });
                                                                  }}
                                                                  className="absolute top-2 right-8 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors z-20"
                                                                  title="Edit"
                                                              >
                                                                  <Edit2 size={14} />
                                                              </button>
                                                            )}

                                                            {!showBulkActions && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if(window.confirm(`Delete "${topic.name}" and all its lessons?`)) {
                                                                        handleDeleteTopicAtPath(child.id, subject.id, topic.id);
                                                                    }
                                                                }}
                                                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-20"
                                                                title="Delete Topic"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            )}

                                                             <div>
                                                                 <div className="font-bold text-gray-800 text-xs mb-3 truncate group-hover:text-blue-600 transition-colors">
                                                                     {topic.name}
                                                                 </div>
                                                             </div>

                                                           <div className="space-y-1">
                                                                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                                                   <span>{topicCompleted}/{topicTotal} completed</span>
                                                                </div>
                                                                <ProgressBar 
                                                                   current={topicCompleted} 
                                                                   total={topicTotal} 
                                                                   heightClass="h-1.5" 
                                                                   colorClass={`bg-${child.themeColor}-500`} 
                                                                />
                                                           </div>
                                                          </>
                                                        )}
                                                   </div>
                                                );
                                              })
                                            )}
                                          
                                          {/* Add Subject Placeholder - Matching Mini Card Height */}
                                          <div 
                                            onClick={() => handleNavigate({ type: 'CURRICULUM_BUILDER' })}
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition cursor-pointer gap-2 min-h-[105px]"
                                          >
                                              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-200 transition">
                                                  <Plus size={16} />
                                              </div>
                                              <span className="text-[10px] font-bold uppercase tracking-wider">Add Subject</span>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
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
                            {user && (
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
                                        <span className="font-medium block">{user.user_metadata?.full_name || user.email}</span>
                                        <span className="text-xs text-gray-500">Daddy Dashboard</span>
                                    </div>
                                </button>
                            )}
                            {data.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { setView({ type: 'CHILD_DASHBOARD', childId: c.id }); setShowProfileDropdown(false); }}
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
                            {user && (
                                <>
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={() => { setView({ type: 'MANAGE_PROFILES' }); setShowProfileDropdown(false); }}
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
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-16 space-y-12 pb-20">
          
          {/* Timeline on Child Dashboard */}
          {isDayActive ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                      <Calendar size={18} /> Today's Plan
                  </div>
                     <Timeline 
                        schedule={schedule}
                        childProfiles={data}
                        focusedChildId={childId}
                        onBlockClick={(cId, sId, tId, lId) => {
                            // Only allow navigating to their own lessons or if needed
                             if(cId === childId) {
                                setView({ type: 'LESSON_PLAYER', childId: cId, subjectId: sId, topicId: tId, lessonId: lId, origin: 'CHILD_DASHBOARD' });
                             }
                        }}
                    />
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
                      onClick={() => setView({ type: 'SUBJECT_DETAIL', childId: child.id, subjectId: subject.id, origin: 'CHILD_DASHBOARD' })}
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
    const [adminDob, setAdminDob] = useState(() => localStorage.getItem('admin_dob') || '');
    const [newAdminAvatar, setNewAdminAvatar] = useState(adminAvatar);
    const [newAdminColor, setNewAdminColor] = useState(() => localStorage.getItem('admin_color') || 'blue');
    const [adminAvatarPage, setAdminAvatarPage] = useState(0);
    
    // Kid edit states
    const [editName, setEditName] = useState('');
    const [editDob, setEditDob] = useState('');
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

    const handleSaveAdmin = () => {
      localStorage.setItem('admin_dob', adminDob);
      localStorage.setItem('admin_color', newAdminColor);
      setAdminAvatar(newAdminAvatar);
      localStorage.setItem('admin_avatar', newAdminAvatar);
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
          };
        });
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
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
      setAvatarPage(0);
      setIsAdding(false);
    };

    const startAddingChild = () => {
      setIsAdding(true);
      setEditingChildId(null);
      setEditName('');
      setEditDob('');
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
        yearGroups: [],
      };
      
      setData(prev => {
        const newData = [...prev, newChild];
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        } else {
          saveLocalData(newData);
        }
        return newData;
      });
      
      setIsAdding(false);
      setEditName('');
      setEditDob('');
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
                      backgroundColor: THEME_COLORS.find(c => c.class === newAdminColor)?.bg || '#f3f4f6'
                    }}
                  >
                    {adminAvatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{user?.user_metadata?.full_name || user?.email || 'Admin'}</h3>
                    <p className="text-sm text-gray-500">Account Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingAdmin(!editingAdmin);
                    setNewAdminAvatar(adminAvatar);
                    setNewAdminColor(localStorage.getItem('admin_color') || 'blue');
                    setAdminDob(localStorage.getItem('admin_dob') || '');
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
                            onClick={() => setNewAdminColor(color.class)}
                            className={`w-10 h-10 rounded-lg transition ${
                              newAdminColor === color.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                            style={{ backgroundColor: color.bg }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* DOB */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (optional)</label>
                      <input
                        type="date"
                        value={adminDob}
                        onChange={(e) => setAdminDob(e.target.value)}
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

  // --- Main Render Switch ---

  return (
    <>
      {view.type === 'LANDING' && <LandingView />}
      {view.type === 'CURRICULUM_BUILDER' && <CurriculumBuilder onBack={() => setView({ type: 'HOME' })} onImport={handleBulkImport} onImportComplete={() => {}} />}
      {view.type === 'SUBJECT_DETAIL' && <SubjectDetail childId={view.childId} subjectId={view.subjectId} origin={view.origin} />}
      {view.type === 'LESSON_PLAYER' && (() => {
        const child = data.find(c => c.id === view.childId);
        const yearGroup = child?.yearGroups.find(yg => yg.subjects.some(s => s.topics.some(t => t.id === view.topicId)));
        const subject = yearGroup?.subjects.find(s => s.topics.some(t => t.id === view.topicId));
        const topic = subject?.topics.find(t => t.id === view.topicId);
        const lesson = topic?.lessons.find(l => l.id === view.lessonId);

        console.log('[LessonPlayer] Loading:', { childId: view.childId, topicId: view.topicId, lessonId: view.lessonId, lesson });

        if (child && subject && topic && lesson) {
          return (
            <LessonPlayer 
              child={child} 
              subject={subject}
              topicId={topic.id}
              lesson={lesson} 
              onBack={() => setView({ type: 'SUBJECT_DETAIL', childId: view.childId, subjectId: subject.id, origin: view.origin })}
              onComplete={(id, time) => handleCompleteLesson(child.id, subject.id, topic.id, id, time)}
            />
          );
        }
        console.error('LessonPlayer: Could not find data', { childId: view.childId, subjectId: view.subjectId, topicId: view.topicId, lessonId: view.lessonId });
        return <div>Error loading lesson - data not found</div>;
      })()}
      {view.type === 'HOME' && <DaddyDashboardView />}
      {view.type === 'CHILD_DASHBOARD' && <ChildDashboard childId={view.childId} />}
      {view.type === 'MANAGE_PROFILES' && <ManageProfilesView />}
      
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
          onSave={(avatar) => {
            setAdminAvatar(avatar);
            localStorage.setItem('admin_avatar', avatar);
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

// Admin Avatar Edit Modal Component
const AdminAvatarEditModal: React.FC<{currentAvatar: string, onSave: (avatar: string) => void, onClose: () => void}> = ({ currentAvatar, onSave, onClose }) => {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [avatarPage, setAvatarPage] = useState(0);
  const AVATARS = ['👶', '🧒', '👦', '👧', '🧑‍🦰', '👱', '🧒', '👦', '👧', '🧒', '👦', '👧', '🧑', '👨‍🦱', '👩‍🦱', '🧑‍🦳', '👨‍🦳', '👩‍🦳', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '🧔', '👨', '👩', '🧑‍🚀', '👩‍🚀', '🧑‍🔬', '👩‍🔬', '🧑‍🎨', '👩‍🎨', '🧑‍🏫', '👩‍🏫', '🧑‍⚕️', '👩‍⚕️', '🧑‍🌾', '👩‍🌾', '🧑‍🍳', '👩‍🍳', '🧑‍🎤', '👩‍🎤', '🧑‍🎭', '👩‍🎭', '🧑‍🚒', '👩‍🚒', '🧑‍✈️', '👩‍✈️', '🧑‍🚀', '👩‍🚀', '🦸', '🦸‍♀️', '🦹', '🦹‍♀️', '🧙', '🧙‍♀️', '🧚', '🧚‍♀️', '🧛', '🧛‍♀️', '🧜', '🧜‍♀️', '🧝', '🧝‍♀️', '🧞', '🧞‍♀️', '🧟', '🧟‍♀️', '👼', '🎅', '🤶', '🦸‍♂️', '🦹‍♂️', '🧙‍♂️', '🧚‍♂️', '🧛‍♂️', '🧜‍♂️', '🧝‍♂️', '🧞‍♂️', '🧟‍♂️', '👼', '🎅', '🤶'];
  const AVATARS_PER_PAGE = 20;
  const totalPages = Math.ceil(AVATARS.length / AVATARS_PER_PAGE);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Admin Avatar</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Avatar Preview */}
          <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-5xl">
              {avatar}
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATARS.slice(avatarPage * AVATARS_PER_PAGE, (avatarPage + 1) * AVATARS_PER_PAGE).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition ${
                      avatar === a
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => setAvatarPage(p => Math.max(0, p - 1))}
                    disabled={avatarPage === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {avatarPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setAvatarPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={avatarPage === totalPages - 1}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onSave(avatar)}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Switcher Dropdown Component
const ProfileSwitcher: React.FC<{
  user: any;
  data: ChildProfile[];
  adminAvatar: string;
  adminColor?: string;
  adminName?: string;
  onSignOut: () => void;
  onManageProfiles: () => void;
  onSwitchProfile: (childId: string) => void;
  onGoToLanding: () => void;
  onGoToAdmin?: () => void;
}> = ({ user, data, adminAvatar, adminColor = 'blue', adminName, onSignOut, onManageProfiles, onSwitchProfile, onGoToLanding, onGoToAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
      >
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ 
              backgroundColor: adminColor === 'blue' ? '#dbeafe' : 
                              adminColor === 'indigo' ? '#e0e7ff' :
                              adminColor === 'purple' ? '#f3e8ff' :
                              adminColor === 'pink' ? '#fce7f3' :
                              adminColor === 'rose' ? '#ffe4e6' :
                              adminColor === 'red' ? '#fee2e2' :
                              adminColor === 'orange' ? '#ffedd5' :
                              adminColor === 'amber' ? '#fef3c7' :
                              adminColor === 'yellow' ? '#fef9c3' :
                              adminColor === 'green' ? '#dcfce7' :
                              adminColor === 'emerald' ? '#d1fae5' :
                              adminColor === 'teal' ? '#ccfbf1' :
                              adminColor === 'cyan' ? '#cffafe' :
                              adminColor === 'sky' ? '#e0f2fe' :
                              '#f1f5f9'
            }}
          >
            {adminAvatar}
          </div>
        )}
        <span className="font-medium text-gray-700 hidden sm:block">{user?.user_metadata?.full_name || user?.email}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 text-white rounded-lg shadow-2xl py-2 z-50">
          {/* Profiles Section */}
          <div className="px-2 pb-2">
            {/* Admin Profile */}
            {onGoToAdmin && (
              <button
                onClick={() => {
                  onGoToAdmin();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-left"
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
                  <span className="font-medium">{adminName || 'Daddy'}</span>
                  <span className="block text-xs text-gray-400">Admin</span>
                </div>
              </button>
            )}
            
            {/* Divider if admin is shown */}
            {onGoToAdmin && data.length > 0 && (
              <div className="border-t border-gray-700 my-2"></div>
            )}
            
            {data.map(child => (
              <button
                key={child.id}
                onClick={() => {
                  onSwitchProfile(child.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl`} style={{ backgroundColor: child.themeColor === 'indigo' ? '#3730a3' : child.themeColor === 'rose' ? '#be123c' : '#065f46' }}>
                  {child.avatar || '👤'}
                </div>
                <span className="font-medium">{child.name || 'Student'}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-2"></div>

          {/* Menu Options */}
          <div className="px-2">
            <button
              onClick={() => {
                onManageProfiles();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-left"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Manage Profiles</span>
            </button>

            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition text-left"
            >
              <LogOut size={20} className="text-gray-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default App;