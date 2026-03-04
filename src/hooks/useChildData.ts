import { useState, useRef, useEffect, useCallback } from 'react';
import { ChildProfile, YearGroup, ProfileTemplate, TopicFrequency } from '../types';
import {
    fetchChildren, fetchChildByEmail, getLocalData
} from '../lib/dataService';
import { saveData, generateUuid } from '../lib/helpers';
import { logger } from '../lib/logger';
import { loadSubjectCardsForYear, SubjectCard } from '../lib/subjectCards';

const YEAR_GROUP_MAP: Record<string, string> = {
    'Year 1 and 2': 'Y1-2',
    'Year 3 and 4': 'Y3-4',
    'Year 5 and 6': 'Y5-6',
    'Year 7/8 and 9': 'Y7-9',
    'Year 10 and 11': 'Y10-11',
    'Year 12 and 13': 'Y12-13',
    'Year 1-2': 'Y1-2',
    'Year 3-4': 'Y3-4',
    'Year 5-6': 'Y5-6',
    'Year 7-8-9': 'Y7-9',
    'Year 10-11': 'Y10-11',
    'Year 12-13': 'Y12-13',
    'Year 5': 'Y5-6',
    'Year 6': 'Y5-6',
    'Year 7': 'Y7-9',
    'Year 8': 'Y7-9',
    'Year 9': 'Y7-9',
    'Year 10': 'Y10-11',
    'Year 11': 'Y10-11',
    'Year 12': 'Y12-13',
    'Year 13': 'Y12-13',
};

const injectSubjectCardsForYear = (children: ChildProfile[], cards: SubjectCard[], targetYearKey: string): ChildProfile[] => {
    return children.map(child => {
        const childYearGroupName = child.yearGroups?.[0]?.name;
        const childYearKey = YEAR_GROUP_MAP[childYearGroupName || ''];

        if (childYearKey !== targetYearKey || !cards.length) {
            return child;
        }

        if ((child as any).hasSubjectCards) return child;
        const hasRealData = child.yearGroups?.[0]?.subjects?.some(s => s.topics?.length > 1);
        if (hasRealData) return child;

        const colorName = child.themeColor || 'blue';

        const newSubjects = cards.map((card: SubjectCard) => ({
            id: `sub-${child.id}-${card.subject.toLowerCase().replace(/\s+/g, '-')}`,
            name: card.subject,
            category: card.subject,
            color: colorName,
            topics: card.playlists.map((playlist, playlistIdx) => ({
                id: `topic-${child.id}-${card.subject.toLowerCase().replace(/\s+/g, '-')}-${playlistIdx}`,
                name: playlist.title,
                lessons: playlist.videos.slice(0, 5).map((video: { id: string; title: string; url: string }, videoIdx: number) => ({
                    id: `les-${child.id}-${card.subject.toLowerCase().replace(/\s+/g, '-')}-${playlistIdx}-${videoIdx}`,
                    title: video.title,
                    videoUrl: video.url,
                    completed: videoIdx < 1,
                    outcomes: []
                }))
            }))
        }));

        return {
            ...child,
            hasSubjectCards: true,
            yearGroups: child.yearGroups.map(yg => ({ ...yg, subjects: newSubjects }))
        };
    });
};

const injectSubjectCardsForAllYears = async (children: ChildProfile[]): Promise<ChildProfile[]> => {
    let result = children;
    const yearKeys: ProfileTemplate[] = ['Y1-2', 'Y3-4', 'Y5-6', 'Y7-9', 'Y10-11', 'Y12-13'];

    for (const yearKey of yearKeys) {
        const cards = await loadSubjectCardsForYear(yearKey);
        if (cards.length > 0) {
            result = injectSubjectCardsForYear(result, cards, yearKey);
        }
    }

    result = result.map(child => {
        const yearGroupName = child.yearGroups?.[0]?.name;
        const yearGroupKey = YEAR_GROUP_MAP[yearGroupName || ''];
        if (!yearGroupKey && !(child as any).hasSubjectCards) {
            return {
                ...child,
                yearGroups: child.yearGroups.map(yg => ({ ...yg, subjects: [] }))
            };
        }
        return child;
    });

    return result;
};

export const useChildData = (user: any, authLoading: boolean) => {
    const [data, setData] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
    const [allChildren, setAllChildren] = useState<{ id: string; name: string; avatar: string; themeColor: string }[]>([]);
    const [parentUid, setParentUid] = useState('');
    const [isDemoMode, setIsDemoMode] = useState(false);

    const lastUserIdRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);

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
                    setData(childrenData.length > 0 ? childrenData : []);
                } else {
                    setChildProfile(null);
                    const localData = getLocalData();
                    setIsDemoMode(localData.length === 0);
                    injectSubjectCardsForAllYears(localData).then(enriched => {
                        setData(enriched);
                    });
                }
            } catch (err) {
                logger.error('Error loading data:', err);
                const localData = getLocalData();
                setIsDemoMode(localData.length === 0);
                injectSubjectCardsForAllYears(localData).then(enriched => {
                    setData(enriched);
                });
            }
            setLoading(false);
            isFetchingRef.current = false;
        };
        loadData();
    }, [user, authLoading]);

    // Update allChildren list
    useEffect(() => {
        if (data.length > 1 || allChildren.length === 0) {
            const list = data.map(c => ({
                id: c.id,
                name: c.name,
                avatar: c.avatar,
                themeColor: c.themeColor
            }));
            setAllChildren(list);
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
            const newData = prev.map(child => child.id !== id ? child : { ...child, ...updates });
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleUpdateChildProfile = useCallback((updates: Partial<ChildProfile>) => {
        if (childProfile) {
            const updated = { ...childProfile, ...updates };
            setChildProfile(updated);
            setData(prev => {
                const newData = prev.map(c => c.id === updated.id ? updated : c);
                saveData(newData, user);
                return newData;
            });
        }
    }, [childProfile, user]);

    const handleAddYearGroup = useCallback((childId: string, name: string) => {
        const newYearGroup: YearGroup = {
            id: `${childId}-${name.replace(/\s+/g, '').toLowerCase()}`,
            name,
            subjects: [],
        };
        setData(prev => {
            const newData = prev.map(child =>
                child.id !== childId ? child : { ...child, yearGroups: [...child.yearGroups, newYearGroup] }
            );
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    const handleRemoveYearGroup = useCallback((childId: string, yearGroupId: string) => {
        setData(prev => {
            const newData = prev.map(child =>
                child.id !== childId ? child : {
                    ...child,
                    yearGroups: child.yearGroups.filter(yg => yg.id !== yearGroupId)
                }
            );
            saveData(newData, user);
            return newData;
        });
    }, [user]);

    return {
        data,
        loading,
        childProfile,
        allChildren,
        parentUid,
        isDemoMode,
        setData,
        setChildProfile,
        handleAddChild,
        handleDeleteChild,
        handleUpdateChild,
        handleUpdateChildProfile,
        handleAddYearGroup,
        handleRemoveYearGroup
    };
};
