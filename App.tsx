import React, { useState, useRef, useEffect } from 'react';
import { ViewState, ChildProfile, YearGroup, Subject, Lesson, ScheduleBlock, ViewOrigin, ParsedRow } from './types';
import { INITIAL_DATA, SUGGESTED_TOPICS, CREATIVE_PROMPTS } from './constants';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { supabase } from './lib/supabase'
import { fetchChildren, fetchChildByEmail, getLocalData, saveLocalData, updateChildGoogleEmail, saveFullCurriculum, saveYearGroup, saveSubject, saveLesson, syncLocalDataToSupabase, hardDeleteLessonFromSupabase, softDeleteLessonInSupabase, restoreLessonInSupabase, hardDeleteSubjectFromSupabase, cleanupDuplicateLessons } from './lib/dataService';
import { usePersistentTimer, formatTime, formatTimeReadable } from './src/lib/useTimer';
import { ProgressBar } from './components/ProgressBar';
import { LessonPlayer } from './components/LessonPlayer';
import { Timeline } from './components/Timeline';
import { CurriculumBuilder } from './components/CurriculumBuilder';
import { ChildManagement } from './components/ChildManagement';
import { EditProfile } from './components/EditProfile';
import { 
  Users, 
  Book, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
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
  X,
  XCircle,
  Archive,
  Lock,
  LogOut,
  UserCircle,
  UserPlus,
  Timer,
  Settings
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
    lastUserIdRef.current = user?.id || null;

    const loadData = async () => {

      console.log('loadData: user =', user?.id || 'null');
      console.log('loadData: user email =', user?.email || 'null');

      setLoading(true);
      try {
        if (user) {
          // Check if user is a child by matching email
          try {
            const childData = await fetchChildByEmail(user.email || '');
            if (childData) {
              console.log('Found child profile:', childData.name);
              setChildProfile(childData);
              setData([]);
              return;
            }
          } catch (e) {
            console.log('Not a child account, checking for admin data');
          }
          
          console.log('Fetching children for userId:', user.id);
          setChildProfile(null);
          const childrenData = await fetchChildren(user.id);
          console.log('Got childrenData:', childrenData.length, 'children');
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
    };
    loadData();
  }, [user, authLoading]);

  // Force load data on initial mount if empty
  useEffect(() => {
    if (!authLoading && data.length === 0 && !user) {
      console.log('Initial mount: loading default data');
      setData(getLocalData());
    }
  }, [authLoading]);

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
  
  const generateSchedule = (hours: number) => {
    const blocks: ScheduleBlock[] = [];
    const now = new Date();
    // Round to next 5 minutes for cleanliness
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
    
    let currentTime = new Date(now);
    
    // Get flattened subjects with incomplete lessons
    const getActiveSubjects = (childId: string) => {
      const child = data.find(c => c.id === childId);
      if (!child) return [];
      // Flatten all subjects from all years
      return child.yearGroups.flatMap(yg => yg.subjects)
             .filter(s => s.lessons.some(l => !l.completed && !l.deleted));
    };

    const adrianPool = getActiveSubjects('adrian');
    const sophiaPool = getActiveSubjects('sophia');
    
    // Fallback if everything is done (shouldn't happen in demo really)
    if (adrianPool.length === 0 || sophiaPool.length === 0) {
      alert("Please add more subjects/lessons first!");
      return;
    }

    let deviceToggle = true; // Toggle who gets the "device" (video) vs "offline" work

    for (let i = 0; i < hours; i++) {
        // --- Academic Block ---
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime.getTime() + 50 * 60000); // 50 mins
        
        // Pick subjects cyclically
        const adrianSub = adrianPool[i % adrianPool.length];
        const sophiaSub = sophiaPool[i % sophiaPool.length];
        
        // Pick specific lessons (first incomplete)
        const adrianLesson = adrianSub.lessons.find(l => !l.completed && !l.deleted) || adrianSub.lessons.find(l => !l.deleted) || adrianSub.lessons[0];
        const sophiaLesson = sophiaSub.lessons.find(l => !l.completed && !l.deleted) || sophiaSub.lessons.find(l => !l.deleted) || sophiaSub.lessons[0];

        // Device logic
        const adrianHasDevice = deviceToggle;
        const sophiaHasDevice = !deviceToggle;

        blocks.push({
            id: `block-${i}`,
            type: 'academic',
            startTime,
            endTime,
            adrian: {
                subjectId: adrianSub.id,
                subjectName: adrianSub.name.split(':')[1]?.trim() || adrianSub.name,
                lessonId: adrianLesson.id,
                lessonTitle: adrianLesson.title,
                hasDevice: adrianHasDevice
            },
            sophia: {
                subjectId: sophiaSub.id,
                subjectName: sophiaSub.name.split(':')[1]?.trim() || sophiaSub.name,
                lessonId: sophiaLesson.id,
                lessonTitle: sophiaLesson.title,
                hasDevice: sophiaHasDevice
            }
        });

        currentTime = endTime;

        // --- Break / Lunch Logic ---
        if (i < hours - 1) { // Don't add break after last block
            if (i === 1) { // Lunch after 2nd block
                const lunchEnd = new Date(currentTime.getTime() + 40 * 60000);
                blocks.push({
                    id: `lunch-${i}`,
                    type: 'lunch',
                    startTime: currentTime,
                    endTime: lunchEnd,
                    label: "Lunch & Free Time"
                });
                currentTime = lunchEnd;
            } else { // Short break
                const breakEnd = new Date(currentTime.getTime() + 10 * 60000);
                blocks.push({
                    id: `break-${i}`,
                    type: 'break',
                    startTime: currentTime,
                    endTime: breakEnd,
                    label: "Refresh Break"
                });
                currentTime = breakEnd;
            }
        }
        
        deviceToggle = !deviceToggle; // Switch device priority next block
    }

    setSchedule(blocks);
    setIsDayActive(true);
  };


  // --- Curriculum Actions ---

  const handleCompleteLesson = (childId: string, subjectId: string, lessonId: string, timeSpentSeconds: number) => {
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
                lessons: sub.lessons.map(l => l.id === lessonId ? { ...l, completed: true, timeSpentSeconds } : l)
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

  const handleSoftDeleteLesson = async (childId: string, subjectId: string, lessonId: string) => {
      const scrollY = window.scrollY;

      if (user) {
        await softDeleteLessonInSupabase(lessonId).catch(err => {
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
                            lessons: sub.lessons.map(l => l.id === lessonId ? { ...l, deleted: true } : l)
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

  const handleBulkImport = (rows: ParsedRow[]) => {
    setData(prevData => {
      const newData = [...prevData];
      const touchedSubjectIds = new Set<string>();

      rows.forEach(row => {
        if (!row.isValid) return;

        let child = newData.find(c => c.name.toLowerCase() === row.childName.toLowerCase());
        if (!child) {
          // Create new child if doesn't exist
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

        let yearGroup = child.yearGroups.find(yg => yg.name.toLowerCase() === row.yearGroup.toLowerCase());
        if (!yearGroup) {
          yearGroup = {
            id: `${child.id}-${row.yearGroup.replace(/\s+/g, '').toLowerCase()}`,
            name: row.yearGroup,
            subjects: []
          };
          child.yearGroups.push(yearGroup);
        }

        const fullSubjectName = `${row.subjectCategory}: ${row.subjectName}`;
        let subject = yearGroup.subjects.find(s => s.name === fullSubjectName);
        let isNewSubject = false;
        if (!subject) {
          let color = 'bg-gray-100 text-gray-800';
          const cat = row.subjectCategory.toLowerCase();
          if (cat.includes('math')) color = 'bg-blue-100 text-blue-800';
          else if (cat.includes('english')) color = 'bg-amber-100 text-amber-800';
          else if (cat.includes('science')) color = 'bg-green-100 text-green-800';
          else if (cat.includes('humanities')) color = 'bg-orange-100 text-orange-800';
          else if (cat.includes('creative')) color = 'bg-purple-100 text-purple-800';

          subject = {
            id: `${child.id}-${row.yearGroup.replace(/\s+/g, '')}-${row.subjectCategory}-${row.subjectName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
            name: fullSubjectName,
            category: row.subjectCategory as any,
            color,
            lessons: []
          };
          yearGroup.subjects.push(subject);
          isNewSubject = true;
          touchedSubjectIds.add(subject.id);
        } else {
          if (!touchedSubjectIds.has(subject.id)) {
            subject.lessons = [];
            touchedSubjectIds.add(subject.id);
          }
        }

        const newLesson: Lesson = {
          id: `${subject.id}-${row.lessonTitle}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
          title: row.lessonTitle,
          durationMinutes: 45,
          completed: false,
          deleted: false,
          videoUrl: row.videoUrl || '',
          outcomes: row.notes ? row.notes.split(',').map((s: string) => s.trim()) : []
        };
        subject.lessons.push(newLesson);
      });

      console.log('Bulk import: saving', newData.length, 'children');
      if (user) {
        saveFullCurriculum(newData, user.id)
          .then(() => console.log('Bulk import: saved to Supabase'))
          .catch(err => console.error('Bulk import error:', err));
      } else {
        saveLocalData(newData);
        console.log('Bulk import: saved to localStorage');
      }
      return newData;
    });
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

  const handleAddLesson = (childId: string, subjectId: string, title: string) => {
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
                            ...sub,
                            lessons: [...sub.lessons, newLesson]
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
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
  };

  const handleRestoreLesson = async (childId: string, subjectId: string, lessonId: string) => {
      const scrollY = window.scrollY;

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
                            lessons: sub.lessons.map(l => l.id === lessonId ? { ...l, deleted: false } : l)
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
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
  };

  const handleHardDeleteLesson = async (childId: string, subjectId: string, lessonId: string) => {
      const scrollY = window.scrollY;

      if (user) {
        await hardDeleteLessonFromSupabase(lessonId).catch(err => {
          console.error('Failed to hard delete lesson in Supabase:', err);
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
                            lessons: sub.lessons.filter(l => l.id !== lessonId)
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

           {/* Admin Utilities - Debug Tools */}
           {user && (
             <div className="mt-12 pt-8 border-t border-gray-200 max-w-5xl mx-auto w-full">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Admin Debug Tools</h3>
               <div className="flex flex-wrap gap-4">
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
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition flex items-center gap-2"
                  >
                    <Book size={16} />
                    Check Subjects
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (!confirm('This will DELETE ALL data from Supabase. Continue?')) return;
                      
                      showStatus('Deleting lessons...', 'info');
                      
                      // Delete lessons first (due to foreign key constraints)
                      const { error: lesError } = await supabase?.from('lessons').delete() || { error: null };
                      if (lesError) {
                        showStatus('Error deleting lessons: ' + lesError.message, 'error');
                        return;
                      }
                      
                      showStatus('Deleting subjects...', 'info');
                      // Delete subjects
                      const { error: subError } = await supabase?.from('subjects').delete() || { error: null };
                      if (subError) {
                        showStatus('Error deleting subjects: ' + subError.message, 'error');
                        return;
                      }
                      
                      showStatus('Deleting year groups...', 'info');
                      // Delete year groups
                      const { error: ygError } = await supabase?.from('year_groups').delete() || { error: null };
                      if (ygError) {
                        showStatus('Error deleting year groups: ' + ygError.message, 'error');
                        return;
                      }
                      
                      showStatus('All data deleted! Reloading...', 'success');
                      setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Nuke All Data
                  </button>

                  <button
                    onClick={async () => {
                      // Get all subjects with their year_group info
                      const { data: subjects, error: fetchError } = await supabase
                        ?.from('subjects')
                        .select('id, name, category, year_group_id')
                        .order('name') || { data: null, error: null };

                      if (fetchError) {
                        showStatus('Error fetching subjects: ' + fetchError.message, 'error');
                        return;
                      }

                      if (!subjects || subjects.length === 0) {
                        showStatus('No subjects found!', 'info');
                        return;
                      }

                      // Get year groups and children to map IDs to names
                      const { data: yearGroups, error: ygError } = await supabase
                        ?.from('year_groups')
                        .select('id, child_id, name')
                        || { data: null, error: null };

                      const { data: children, error: childError } = await supabase
                        ?.from('children')
                        .select('id, name')
                        || { data: null, error: null };

                      if (ygError || childError) {
                        showStatus('Error fetching year groups or children', 'error');
                        return;
                      }

                      // Create maps for lookups
                      const ygToInfo = new Map<string, { childId: string; childName: string; ygName: string }>();
                      yearGroups?.forEach(yg => {
                        const child = children?.find(c => c.id === yg.child_id);
                        ygToInfo.set(yg.id, { 
                          childId: yg.child_id, 
                          childName: child?.name || 'Unknown',
                          ygName: yg.name 
                        });
                      });

                      // Build key: child_id + year_group_id + subject_name
                      const keyCounts: Record<string, { ids: string[]; info: { childName: string; ygName: string; subjectName: string; category: string } }> = {};
                      subjects.forEach(s => {
                        const ygInfo = ygToInfo.get(s.year_group_id);
                        if (!ygInfo) return;
                        
                        const key = `${ygInfo.childId}::${s.year_group_id}::${s.name}`;
                        if (!keyCounts[key]) {
                          keyCounts[key] = { ids: [], info: { childName: ygInfo.childName, ygName: ygInfo.ygName, subjectName: s.name, category: s.category } };
                        }
                        keyCounts[key].ids.push(s.id);
                      });

                      // Find true duplicates
                      const duplicates = Object.entries(keyCounts).filter(([_, data]) => data.ids.length > 1);
                      
                      if (duplicates.length === 0) {
                        showStatus('No duplicate subjects found!', 'success');
                        return;
                      }

                      // Collect IDs to delete
                      const toDelete: string[] = [];
                      duplicates.forEach(([_, data]) => {
                        toDelete.push(...data.ids.slice(1));
                      });

                      // Show detailed confirmation with child/year/subject/category
                      const dupList = duplicates.map(([_, data]) => 
                        `• ${data.info.subjectName} (${data.info.category})\n  ${data.info.childName} • ${data.info.ygName} • ${data.ids.length}x`
                      ).join('\n\n');

                      if (!confirm(`Found ${duplicates.length} duplicate groups:\n\n${dupList}\n\nOnly 1 copy of each will be kept.\n\nContinue?`)) return;

                      // Delete duplicates
                      showStatus(`Deleting ${toDelete.length} duplicate subjects...`, 'info');
                      const { error: delError } = await supabase
                        ?.from('subjects')
                        .delete()
                        .in('id', toDelete) || { error: null };

                      if (delError) {
                        showStatus('Error deleting duplicates: ' + delError.message, 'error');
                        return;
                      }

                      showStatus(`Deleted ${toDelete.length} duplicate subjects! Reloading...`, 'success');
                      setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 transition flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Delete Duplicates
                  </button>
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
    
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [showTrash, setShowTrash] = useState(false);
    
    // Admin Mode Check
    const isReadOnly = origin === 'CHILD_DASHBOARD';

    // Persistent timer for subject
    const { isRunning, elapsed, start, stop } = usePersistentTimer({
      subjectId,
      onTick: () => {},
      onSave: () => {},
      autoSaveInterval: 30,
    });

    // Start timer when viewing subject
    useEffect(() => {
      start();
      return () => stop();
    }, [subjectId]);

    // Scroll to top when mounting detail view
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBack = () => {
        stop();
        if (origin === 'HOME') {
            setView({ type: 'HOME' });
        } else {
            setView({ type: 'CHILD_DASHBOARD', childId });
        }
    };

    if (!child || !subject) return <div>Subject not found</div>;

    const activeLessons = subject.lessons.filter(l => !l.deleted);
    const deletedLessons = subject.lessons.filter(l => l.deleted);

    return (
        <div className="min-h-screen bg-white">
            <header className={`bg-${child.themeColor}-600 text-white p-6 sticky top-0 z-10 shadow-md`}>
                <div className="max-w-4xl mx-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 hover:opacity-80 mb-4 transition">
                        <ArrowLeft size={20}/> Back to {isReadOnly ? `${child.name}'s Space` : 'Daddy Dashboard'}
                    </button>
                    <div className="flex justify-between items-end">
                        <div>
                             <h1 className="text-3xl font-bold">{subject.name}</h1>
                             <p className="opacity-90">{child.name} • {yg?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                <Timer size={18} />
                                <span className="font-mono font-bold">{formatTime(elapsed)}</span>
                                {isRunning && <span className="text-green-300">●</span>}
                            </div>
                        </div>
                        <div className="text-4xl opacity-50 ml-4">{child.avatar}</div>
                    </div>
                </div>
            </header>
            
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                 {/* Stats */}
                 <div className="flex gap-4">
                     <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1">
                         <div className="text-sm text-gray-500">Active Lessons</div>
                         <div className="text-2xl font-bold text-gray-800">{activeLessons.length}</div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1">
                         <div className="text-sm text-gray-500">Completed</div>
                         <div className={`text-2xl font-bold text-${child.themeColor}-600`}>
                             {activeLessons.filter(l => l.completed).length}
                         </div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex-1">
                         <div className="text-sm text-gray-500">Time Spent</div>
                         <div className={`text-2xl font-bold text-${child.themeColor}-600`}>
                             {formatTimeReadable(elapsed)}
                         </div>
                     </div>
                 </div>

                 {/* Lesson List */}
                 <div className="space-y-3">
                     <h2 className="text-xl font-bold text-gray-800">Curriculum Path</h2>
                     {activeLessons.length === 0 ? (
                         <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                             No active lessons. {isReadOnly ? "Ask Daddy to add some!" : "Add one below!"}
                         </div>
                     ) : (
                         activeLessons.map((lesson, idx) => (
                             <div key={lesson.id} className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition">
                                 <div className="flex items-center gap-4 overflow-hidden">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                         lesson.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                     }`}>
                                         {idx + 1}
                                     </div>
                                     <div className="min-w-0">
                                         <h3 className={`font-medium truncate ${lesson.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                             {lesson.title}
                                         </h3>
                                         <div className="flex gap-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Clock size={12}/> {lesson.durationMinutes}m</span>
                                            {lesson.videoUrl && <span className="flex items-center gap-1"><PlayCircle size={12}/> Video</span>}
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                     <button 
                                         onClick={() => setView({ type: 'LESSON_PLAYER', childId, subjectId, lessonId: lesson.id, origin })}
                                         className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                                             lesson.completed 
                                             ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                             : `bg-${child.themeColor}-50 text-${child.themeColor}-700 hover:bg-${child.themeColor}-100`
                                         }`}
                                     >
                                         {lesson.completed ? 'Review' : 'Start'} <Play size={14}/>
                                     </button>
                                     {!isReadOnly && (
                                         <button 
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleSoftDeleteLesson(childId, subjectId, lesson.id);
                                             }}
                                             title="Move to Trash"
                                             className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                         >
                                             <Trash2 size={16}/>
                                         </button>
                                     )}
                                 </div>
                             </div>
                         ))
                     )}
                 </div>

                 {/* Add Lesson - Only for Admin */}
                 {!isReadOnly && (
                     <div className="pt-4 border-t border-gray-200">
                         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Add New Lesson</h3>
                         <div className="flex gap-3">
                             <input 
                                 type="text" 
                                 value={newLessonTitle}
                                 onChange={(e) => setNewLessonTitle(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(childId, subjectId, newLessonTitle)}
                                 placeholder="e.g. Introduction to Algebra..."
                                 className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                             />
                             <button 
                                 onClick={() => {
                                     handleAddLesson(childId, subjectId, newLessonTitle);
                                     setNewLessonTitle("");
                                 }}
                                 disabled={!newLessonTitle.trim()}
                                 className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 Add
                             </button>
                         </div>
                     </div>
                 )}

                 {/* Trash / Archive Section - Only for Admin */}
                 {!isReadOnly && deletedLessons.length > 0 && (
                     <div className="pt-8 border-t border-gray-200">
                         <button 
                             onClick={() => setShowTrash(!showTrash)}
                             className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm mb-4"
                         >
                             <Archive size={16}/> {showTrash ? 'Hide Trash' : `Show Trash (${deletedLessons.length})`}
                         </button>

                         {showTrash && (
                             <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                 {deletedLessons.map((lesson) => (
                                     <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg opacity-75">
                                         <span className="text-gray-500 line-through text-sm font-medium">{lesson.title}</span>
                                         <div className="flex gap-2">
                                             <button 
                                                 onClick={() => handleRestoreLesson(childId, subjectId, lesson.id)}
                                                 className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                                                 title="Restore Lesson"
                                             >
                                                 <RotateCcw size={16}/>
                                             </button>
                                             <button 
                                                 onClick={() => {
                                                     if(confirm('Permanently delete this lesson?')) {
                                                         handleHardDeleteLesson(childId, subjectId, lesson.id);
                                                     }
                                                 }}
                                                 className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                 title="Permanently Delete"
                                             >
                                                 <XCircle size={16}/>
                                             </button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 )}
                  
                 {!isReadOnly && (
                     <div className="flex justify-end pt-8">
                         <button 
                             onClick={() => {
                                 if(confirm('Are you sure you want to delete this entire subject and all lessons?')) {
                                     handleDeleteSubject(childId, subjectId);
                                     setView({ type: 'HOME' });
                                 }
                             }}
                             className="text-red-500 text-sm hover:underline flex items-center gap-2"
                         >
                             <Trash2 size={14}/> Delete Entire Subject
                         </button>
                     </div>
                 )}
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

    // Bulk selection state for subjects
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);

    const toggleSubjectSelection = (subjectId: string) => {
      const newSelected = new Set(selectedSubjects);
      if (newSelected.has(subjectId)) {
        newSelected.delete(subjectId);
      } else {
        newSelected.add(subjectId);
      }
      setSelectedSubjects(newSelected);
      setShowBulkActions(newSelected.size > 0);
    };

    const selectAllSubjects = () => {
      const allIds = new Set<string>();
      data.forEach(child => {
        child.yearGroups.forEach(yg => {
          yg.subjects.forEach(s => allIds.add(s.id));
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
      if (!confirm(`Permanently delete ${selectedSubjects.size} subjects? This cannot be undone.`)) return;

      // Collect all subject-child pairs first (before state updates)
      const deletions: { childId: string; subjectId: string }[] = [];
      for (const child of data) {
        for (const yg of child.yearGroups) {
          for (const subject of yg.subjects) {
            if (selectedSubjects.has(subject.id)) {
              deletions.push({ childId: child.id, subjectId: subject.id });
            }
          }
        }
      }

      // Delete from Supabase first
      for (const { subjectId } of deletions) {
        await hardDeleteSubjectFromSupabase(subjectId).catch(err => {
          console.error('Failed to delete subject from Supabase:', err);
        });
      }

      // Then update local state
      setData(prev => {
        const newData = prev.map(child => ({
          ...child,
          yearGroups: child.yearGroups.map(yg => ({
            ...yg,
            subjects: yg.subjects.filter(s => !selectedSubjects.has(s.id))
          }))
        }));
        if (user) {
          saveFullCurriculum(newData, user.id).catch(console.error);
        }
        return newData;
      });

      clearSelection();
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
            
            <div className="flex gap-3 items-center">
                <button 
                    onClick={() => handleNavigate({ type: 'CURRICULUM_BUILDER' })}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
                >
                    <Sparkles size={16} /> Build Curriculum
                </button>
                {user && (
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
                             .filter(s => s.lessons.some(l => !l.deleted))
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
                                      const activeTotal = sub.lessons.filter(l => !l.deleted).length;
                                      const activeCompleted = sub.lessons.filter(l => l.completed && !l.deleted).length;
                                      return (
                                          <div key={sub.id} className="p-3 rounded-xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition cursor-default">
                                             <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${sub.color.includes('blue') ? 'bg-blue-500' : sub.color.includes('green') ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                <div className="text-xs font-bold text-gray-700 truncate w-full">{sub.category}</div>
                                             </div>
                                             <div className="text-[11px] text-gray-500 truncate mb-3 leading-tight min-h-[1.5em]">
                                                {sub.name.includes(':') ? sub.name.split(':')[1].trim() : sub.name}
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
                        onBlockClick={(childId, subjectId, lessonId) => {
                            handleNavigate({ type: 'LESSON_PLAYER', childId, subjectId, lessonId, origin: 'HOME' });
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
                              const ygTotal = yg.subjects.reduce((acc, s) => acc + s.lessons.filter(l=>!l.deleted).length, 0);
                              const ygCompleted = yg.subjects.reduce((acc, s) => acc + s.lessons.filter(l => l.completed && !l.deleted).length, 0);
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
                                          {yg.subjects.map(subject => {
                                              const subCompleted = subject.lessons.filter(l => l.completed && !l.deleted).length;
                                              const subTotal = subject.lessons.filter(l => !l.deleted).length;
                                              const isSelected = selectedSubjects.has(subject.id);

                                              return (
                                                  <div 
                                                      key={subject.id}
                                                      onClick={() => showBulkActions ? toggleSubjectSelection(subject.id) : handleNavigate({ type: 'SUBJECT_DETAIL', childId: child.id, subjectId: subject.id, origin: 'HOME' })}
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
                                                         {subCompleted === subTotal && subTotal > 0 && <CheckCircle size={14} className="text-green-500" />}
                                                      </div>
                                                      
                                                      {!showBulkActions && (
                                                      <button
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              if(window.confirm(`Are you sure you want to delete "${subject.name}"?`)) {
                                                                  handleDeleteSubject(child.id, subject.id);
                                                              }
                                                          }}
                                                          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-20"
                                                          title="Delete Subject"
                                                      >
                                                          <Trash2 size={16} />
                                                      </button>
                                                      )}

                                                      <div>
                                                          {/* Subject Name */}
                                                          <div className="font-bold text-gray-800 text-xs mb-3 truncate group-hover:text-blue-600 transition-colors">
                                                              {subject.name.includes(':') ? subject.name.split(':')[1].trim() : subject.name}
                                                          </div>
                                                      </div>

                                                      {/* Stats & Progress */}
                                                      <div className="space-y-1">
                                                           <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                                              <span>{subCompleted}/{subTotal} completed</span>
                                                           </div>
                                                           <ProgressBar 
                                                              current={subCompleted} 
                                                              total={subTotal} 
                                                              heightClass="h-1.5" 
                                                              colorClass={`bg-${child.themeColor}-500`} 
                                                           />
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                          
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
    const child = data.find(c => c.id === childId) || childProfile;
    if (!child) return null;

    const { user, signOut } = useAuth() || {};

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`bg-${child.themeColor}-600 text-white pb-24 pt-8 px-6`}>
           <div className="max-w-6xl mx-auto">
              <div className="flex justify-end items-start mb-6">
                  {user && (
                    <ProfileSwitcher
                      user={user}
                      data={data}
                      adminAvatar={adminAvatar}
                      adminColor={adminColor}
                      adminName={user?.user_metadata?.full_name || user?.email || 'Admin'}
                      onSignOut={() => signOut?.()}
                      onManageProfiles={() => setView({ type: 'MANAGE_PROFILES' })}
                      onSwitchProfile={(newChildId) => setView({ type: 'CHILD_DASHBOARD', childId: newChildId })}
                      onGoToLanding={() => setView({ type: 'LANDING' })}
                      onGoToAdmin={() => setView({ type: 'HOME' })}
                    />
                  )}
              </div>
             <div className="flex items-center gap-4">
                <span className="text-6xl">{child.avatar}</span>
                <div>
                   <h1 className="text-3xl font-bold">{child.name}'s Space</h1>
                   <p className="text-white/80">Ready to learn today?</p>
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
                    focusedChildId={childId}
                    onBlockClick={(cId, sId, lId) => {
                        // Only allow navigating to their own lessons or if needed
                         if(cId === childId) {
                            setView({ type: 'LESSON_PLAYER', childId: cId, subjectId: sId, lessonId: lId, origin: 'CHILD_DASHBOARD' });
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
                  const completedCount = subject.lessons.filter(l => l.completed && !l.deleted).length;
                  const totalCount = subject.lessons.filter(l => !l.deleted).length;
                  
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
                              {subject.name.includes(':') ? subject.name.split(':')[1].trim() : subject.name}
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
        id: Math.random().toString(36).substr(2, 9),
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
      {view.type === 'CURRICULUM_BUILDER' && <CurriculumBuilder onBack={() => setView({ type: 'HOME' })} onImport={handleBulkImport} />}
      {view.type === 'SUBJECT_DETAIL' && <SubjectDetail childId={view.childId} subjectId={view.subjectId} origin={view.origin} />}
      {view.type === 'LESSON_PLAYER' && (() => {
        const child = data.find(c => c.id === view.childId);
        const yearGroup = child?.yearGroups.find(yg => yg.subjects.some(s => s.id === view.subjectId));
        const subject = yearGroup?.subjects.find(s => s.id === view.subjectId);
        const lesson = subject?.lessons.find(l => l.id === view.lessonId);

        if (child && subject && lesson) {
          return (
            <LessonPlayer 
              child={child} 
              subject={subject} 
              lesson={lesson} 
              onBack={() => setView({ type: 'SUBJECT_DETAIL', childId: view.childId, subjectId: view.subjectId, origin: view.origin })}
              onComplete={(id, time) => handleCompleteLesson(child.id, subject.id, id, time)}
            />
          );
        }
        return <div>Error loading lesson</div>;
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