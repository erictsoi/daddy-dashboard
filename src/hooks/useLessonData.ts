import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChildProfile, Lesson, ParsedRow, ParsedTemplateRow, TopicFrequency } from '../types';
import { hardDeleteSubjectFromFirebase } from '../lib/dataService';
import { saveData, generateUuid } from '../lib/helpers';
import { logger } from '../lib/logger';

export const useLessonData = (user: any, setData: React.Dispatch<React.SetStateAction<ChildProfile[]>>) => {
    const navigate = useNavigate();
    const isBulkImportingRef = useRef(false);

    const handleBulkImport = useCallback((rows: ParsedRow[]) => {
        if (isBulkImportingRef.current) return;
        isBulkImportingRef.current = true;

        setData(prev => {
            const newData = [...prev];

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
                    const sanitized = topicName.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-');
                    topic = {
                        id: `${subject.id}-topic-${sanitized}-${Date.now()}`.slice(0, 50),
                        name: topicName,
                        lessons: []
                    };
                    subject.topics.push(topic);
                }

                const lessonTitle = row.lessonTitle || row.lessonNotes || `Lesson ${topic.lessons.length + 1}`;
                if (!topic.lessons.find(l => l.title.toLowerCase() === lessonTitle.toLowerCase())) {
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

            saveData(newData, user);
            return newData;
        });

        isBulkImportingRef.current = false;
        navigate('/admindash');
    }, [user, navigate, setData]);

    const handleTemplateImport = useCallback((rows: ParsedTemplateRow[]) => {
        if (isBulkImportingRef.current) return;
        isBulkImportingRef.current = true;

        setData(prev => {
            const newData = [...prev];

            rows.forEach(row => {
                if (!row.isValid) return;

                const profileMap: Record<string, string> = {
                    'y1/2 child': 'Y1-2', 'y1/2': 'Y1-2',
                    'y3/4 child': 'Y3-4', 'y3/4': 'Y3-4',
                    'y5/6 child': 'Y5-6', 'y5/6': 'Y5-6',
                    'y7/9 child': 'Y7-9', 'y7/9': 'Y7-9',
                    'y10/11 child': 'Y10-11', 'y10/11': 'Y10-11',
                    'y12/13 child': 'Y12-13', 'y12/13': 'Y12-13'
                };
                const profileTemplate = profileMap[row.profile.toLowerCase()] || 'Y5-6';

                const profileToYear: Record<string, string> = {
                    'Y1-2': 'Year 1', 'Y3-4': 'Year 3', 'Y5-6': 'Year 5',
                    'Y7-9': 'Year 7', 'Y10-11': 'Year 10', 'Y12-13': 'Year 12'
                };
                const defaultYear = profileToYear[profileTemplate] || 'Year 5';

                let child = newData.find(c => c.name.toLowerCase() === row.profile.toLowerCase());
                if (!child) {
                    child = {
                        id: `child-${row.profile.toLowerCase().replace(/\s+/g, '-')}`,
                        name: row.profile,
                        dob: '',
                        avatar: '👶',
                        themeColor: 'blue',
                        yearGroups: [{ id: `yg-${row.profile.toLowerCase().replace(/\s+/g, '-')}`, name: defaultYear, subjects: [] }],
                        profileTemplate: profileTemplate as any,
                        profileData: {
                            template: profileTemplate as any,
                            customName: row.profile,
                            interests: [],
                            stacks: [],
                            approved: false,
                            createdAt: new Date().toISOString()
                        }
                    };
                    newData.push(child);
                }

                if (!child.profileData) {
                    child.profileData = {
                        template: profileTemplate as any,
                        customName: child.name,
                        interests: [],
                        stacks: [],
                        approved: false,
                        createdAt: new Date().toISOString()
                    };
                }

                const stackType = row.subject;
                let stack = child.profileData.stacks.find(s => s.type === stackType);
                if (!stack) {
                    stack = { type: stackType as any, cards: [] };
                    child.profileData.stacks.push(stack);
                }

                const playlists = [
                    { label: 'Primary', url: row.primaryPlaylist },
                    { label: 'Backup 1', url: row.backupPlaylist1 },
                    { label: 'Backup 2', url: row.backupPlaylist2 }
                ];

                playlists.forEach((playlist, idx) => {
                    if (!playlist.url) return;
                    const cardId = `${row.subject.toLowerCase().replace(/\s+/g, '-')}-${row.focus.toLowerCase().replace(/\s+/g, '-')}-${idx}`;
                    if (!stack!.cards.find(c => c.id === cardId)) {
                        stack!.cards.push({
                            id: cardId,
                            focus: `${row.focus} (${playlist.label})`,
                            primaryPlaylist: playlist.url,
                            backupPlaylist1: undefined,
                            backupPlaylist2: undefined,
                            notes: row.notes,
                            outcomes: row.outcomes,
                            approved: false
                        });
                    }
                });
            });

            saveData(newData, user);
            return newData;
        });

        isBulkImportingRef.current = false;
        navigate('/admindash');
    }, [user, navigate, setData]);

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
                                        lessons: topic.lessons.map(l =>
                                            l.id === lessonId ? { ...l, completed: true, timeSpentSeconds } : l
                                        )
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
    }, [user, setData]);

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
    }, [user, setData]);

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
    }, [user, setData]);

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
    }, [user, setData]);

    const handleHardDeleteLesson = useCallback((childId: string, subjectId: string, topicId: string, lessonId: string) => {
        setData(prevData => {
            const newData = structuredClone(prevData);
            const targetChild = newData.find((c: any) => c.id === childId);
            if (!targetChild) return prevData;
            const targetYG = targetChild.yearGroups.find((yg: any) => yg.subjects.some((s: any) => s.id === subjectId));
            if (!targetYG) return prevData;
            const targetSub = targetYG.subjects.find((s: any) => s.id === subjectId);
            if (!targetSub) return prevData;
            const targetTopic = targetSub.topics.find((t: any) => t.id === topicId);
            if (!targetTopic) return prevData;
            targetTopic.lessons = targetTopic.lessons.filter((l: any) => l.id !== lessonId);
            saveData(newData, user);
            return newData;
        });
    }, [user, setData]);

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
    }, [user, setData]);

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
                                topics: s.topics.map(t => t.id !== topicId ? t : { ...t, frequency })
                            };
                        })
                    }))
                };
            });
            saveData(newData, user);
            return newData;
        });
    }, [user, setData]);

    return {
        handleBulkImport,
        handleTemplateImport,
        handleCompleteLesson,
        handleDeleteSubject,
        handleAddLesson,
        handleRestoreLesson,
        handleHardDeleteLesson,
        handleSoftDeleteLesson,
        handleUpdateTopicFrequency
    };
};
