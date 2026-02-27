import { useState, useCallback } from 'react';
import { ChildProfile, ScheduleBlock, TopicFrequency } from '../types';
import { frequencyToWeight, getSubjectWeight } from '../lib/scheduleUtils';

export const useSchedule = (data: ChildProfile[]) => {
    const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
    const [isDayActive, setIsDayActive] = useState(false);

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

        const activeChildren = data.filter(child => {
            const subjects = child.yearGroups.flatMap(yg => yg.subjects);
            return subjects.length > 0;
        });

        if (activeChildren.length === 0) {
            alert("Please add more subjects/lessons first!");
            return;
        }

        const childSubjects: Record<string, { subjects: any[], topics: any[], subjectIndex: number, topicIndex: number }> = {};
        const storedChildFreqMode = localStorage.getItem('childFreqMode');
        const childFreqMode = storedChildFreqMode ? JSON.parse(storedChildFreqMode) : ['balanced', 'balanced'];

        const perSubjectWeightsMap: Record<number, any> = {};

        activeChildren.forEach((child, childIdx) => {
            const storedFreq = localStorage.getItem(`freqMode_${child.id}`);
            const perSubjectWeights = storedFreq ? JSON.parse(storedFreq) : {};
            perSubjectWeightsMap[childIdx] = perSubjectWeights;

            const subjects = shuffle(child.yearGroups.flatMap(yg => yg.subjects));
            const allTopics: any[] = [];
            subjects.forEach((s: any) => {
                s.topics.forEach((t: any) => {
                    const topicFreq = frequencyToWeight(t.frequency) || getSubjectWeight(s.name, childIdx, childFreqMode, perSubjectWeightsMap);
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
            const hasDevice = i % activeChildren.length;

            activeChildren.forEach((child, idx) => {
                const childData = childSubjects[child.id];
                if (!childData) return;

                const topicData = childData.topics[childData.topicIndex % childData.topics.length];
                if (!topicData) return;

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

    return {
        schedule,
        isDayActive,
        setSchedule,
        setIsDayActive,
        generateSchedule
    };
};
