import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChildProfile, YearGroup, Subject, Topic, Lesson, ParsedRow, TopicFrequency, UserSettings } from '../types';
import {
    fetchChildren, fetchChildByEmail, getLocalData,
    saveFullCurriculum, hardDeleteSubjectFromFirebase,
    fetchUserSettings, saveUserSettings
} from '../lib/dataService';
import { saveData, generateUuid } from '../lib/helpers';
import { logger } from '../lib/logger';

export const useAppData = (user: any, authLoading: boolean) => {
    const navigate = useNavigate();
    const [data, setData] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
    const [allChildren, setAllChildren] = useState<{ id: string, name: string, avatar: string, themeColor: string }[]>([]);

    const [adminAvatar, setAdminAvatar] = useState('👨‍🏫');
    const [adminColor, setAdminColor] = useState('blue');
    const [adminName, setAdminName] = useState('');
    const [adminDob, setAdminDob] = useState('');
    const [parentEmailInput, setParentEmailInput] = useState('');
    const [parentUid, setParentUid] = useState('');

    const lastUserIdRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);
    const isBulkImportingRef = useRef(false);

    // Load data on mount and when user changes
    useEffect(() => {
        if (authLoading) return;

        if (lastUserIdRef.current === user?.uid && data.length > 0) return;
        if (isFetchingRef.current) return;

        lastUserIdRef.current = user?.uid || null;
        isFetchingRef.current = true;

        const loadData = async () => {
            setLoading(true);
            try {
                if (user) {
                    try {
                        const settings = await fetchUserSettings(user.uid);
                        setAdminName(settings.adminName);
                        setAdminAvatar(settings.adminAvatar);
                        setAdminColor(settings.adminColor);
                        setAdminDob(settings.adminDob);
                        setParentEmailInput(settings.parentEmail);
                    } catch (e) {
                        logger.log('No settings found, using defaults');
                    }

                    try {
                        const childResult = await fetchChildByEmail(user.email || '');
                        if (childResult.child && childResult.child.length > 0) {
                            setChildProfile(childResult.child[0]);
                            if (childResult.parentUid) setParentUid(childResult.parentUid);

                            if (childResult.allChildren.length > 0) {
                                setAllChildren(childResult.allChildren);
                                setData(childResult.allChildren);
                            } else {
                                setData(childResult.child);
                            }
                            setLoading(false);
                            isFetchingRef.current = false;
                            return;
                        }
                    } catch (e) {
                        logger.log('Not a child account, checking for admin data');
                    }

                    const childrenData = await fetchChildren(user.uid);
                    if (childrenData.length > 0) {
                        setData(childrenData);
                    } else {
                        setData([]);
                    }
                } else {
                    setChildProfile(null);
                    setData(getLocalData());
                }
            } catch (err) {
                logger.error('Error loading data:', err);
                setData(getLocalData());
            }
            setLoading(false);
            isFetchingRef.current = false;
        };
        loadData();
    }, [user, authLoading]);

    // Auto-detect child sign-in
    useEffect(() => {
        if (authLoading || loading || !user) {
            if (!user) setChildProfile(null);
            return;
        }

        const userEmail = user.email?.toLowerCase() || '';
        const matchedChild = data.find(child =>
            child.googleEmail?.toLowerCase() === userEmail
        );

        if (matchedChild) {
            setChildProfile(matchedChild);
            navigate(`/child/${matchedChild.id}`);
        } else if (childProfile && userEmail) {
            const currentChildEmail = childProfile.googleEmail?.toLowerCase() || '';
            if (currentChildEmail !== userEmail) {
                setChildProfile(null);
            }
        }
    }, [user, data, authLoading, loading]);

    // Update allChildren list
    useEffect(() => {
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

    const handleAddChild = useCallback((childData: Omit<ChildProfile, 'id' | 'yearGroups'>) => {
        const newChild: ChildProfile = {
            ...childData,
            id: generateUuid(),
            yearGroups: [],
        };
        setData(prev => {
            const newData = [...prev, newChild];
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleDeleteChild = useCallback((id: string) => {
        setData(prev => {
            const newData = prev.filter(child => child.id !== id);
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleUpdateChild = useCallback((id: string, updates: Partial<ChildProfile>) => {
        setData(prev => {
            const newData = prev.map(child => {
                if (child.id !== id) return child;
                return { ...child, ...updates };
            });
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleUpdateChildProfile = useCallback((updates: Partial<ChildProfile>) => {
        if (childProfile) {
            const updated = { ...childProfile, ...updates };
            setChildProfile(updated);
            const allChildren = data.map(c => c.id === updated.id ? updated : c);
            saveData(allChildren, user);
        }
    }, [childProfile, data, user]);

    const handleAddYearGroup = useCallback((childId: string, name: string) => {
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
    }, [user]);

    const handleRemoveYearGroup = useCallback((childId: string, yearGroupId: string) => {
        setData(prev => {
            const newData = prev.map(child => {
                if (child.id !== childId) return child;
                return { ...child, yearGroups: child.yearGroups.filter(yg => yg.id !== yearGroupId) };
            });
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleCompleteLesson = useCallback((childId: string, subjectId: string, topicId: string, lessonId: string, timeSpentSeconds: number) => {
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
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleBulkImport = useCallback((rows: ParsedRow[]) => {
        if (isBulkImportingRef.current) return;
        isBulkImportingRef.current = true;

        const newData = [...data];

        rows.forEach(row => {
            if (!row.isValid) return;

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

            let yearGroup = child.yearGroups.find(yg => yg.name.toLowerCase() === row.yearGroup.toLowerCase());
            if (!yearGroup) {
                yearGroup = {
                    id: `${child.id}-${row.yearGroup.replace(/\s+/g, '').toLowerCase()}`,
                    name: row.yearGroup,
                    subjects: []
                };
                child.yearGroups.push(yearGroup);
            }

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

            const lessonTitle = row.lessonTitle || row.lessonNotes || `Lesson ${topic.lessons.length + 1}`;
            const duplicateLesson = topic.lessons.find(l => l.title.toLowerCase() === lessonTitle.toLowerCase());

            if (!duplicateLesson) {
                const lessonIndex = row.videoPosition || topic.lessons.length + 1;
                const newLesson: Lesson = {
                    id: generateUuid(),
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
            }
        });

        setData(newData);
        saveData(newData, user);
        isBulkImportingRef.current = false;
        navigate('/admindash');
    }, [data, user, navigate]);

    const handleDeleteSubject = useCallback(async (childId: string, subjectId: string) => {
        if (user) {
            await hardDeleteSubjectFromFirebase(subjectId, childId, user.uid).catch(logger.error);
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
    }, [user]);

    const handleAddLesson = useCallback((childId: string, subjectId: string, topicId: string, title: string) => {
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
                                        id: generateUuid(),
                                        title,
                                        durationMinutes: 45,
                                        completed: false,
                                        deleted: false,
                                        outcomes: [],
                                        videoUrl: ''
                                    };
                                    return { ...topic, lessons: [...topic.lessons, newLesson] };
                                })
                            };
                        })
                    }))
                };
            });
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleRestoreLesson = useCallback((childId: string, subjectId: string, topicId: string, lessonId: string) => {
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
    }, [user]);

    const handleHardDeleteLesson = useCallback((childId: string, subjectId: string, topicId: string, lessonId: string) => {
        setData(prevData => {
            const newData = structuredClone(prevData);
            const targetChild = newData.find((c: any) => c.id === childId);
            if (!targetChild) return prevData;

            const targetYG = targetChild.yearGroups.find((yg: any) =>
                yg.subjects.some((s: any) => s.id === subjectId)
            );
            if (!targetYG) return prevData;

            const targetSub = targetYG.subjects.find((s: any) => s.id === subjectId);
            if (!targetSub) return prevData;

            const targetTopic = targetSub.topics.find((t: any) => t.id === topicId);
            if (!targetTopic) return prevData;

            targetTopic.lessons = targetTopic.lessons.filter((l: any) => l.id !== lessonId);
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleSoftDeleteLesson = useCallback((childId: string, subjectId: string, topicId: string, lessonId: string) => {
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
    }, [user]);

    const handleUpdateTopicFrequency = useCallback((childId: string, subjectId: string, topicId: string, frequency: TopicFrequency) => {
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
    }, [user]);

    return {
        data,
        loading,
        childProfile,
        allChildren,
        adminAvatar,
        adminColor,
        adminName,
        adminDob,
        parentEmailInput,
        parentUid,
        setAdminAvatar,
        setAdminName,
        setAdminDob,
        setAdminColor,
        setParentEmailInput,
        handleAddChild,
        handleDeleteChild,
        handleUpdateChild,
        handleUpdateChildProfile,
        handleAddYearGroup,
        handleRemoveYearGroup,
        handleCompleteLesson,
        handleBulkImport,
        handleDeleteSubject,
        handleAddLesson,
        handleRestoreLesson,
        handleHardDeleteLesson,
        handleSoftDeleteLesson,
        handleUpdateTopicFrequency
    };
};
