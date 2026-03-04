import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettingsData } from './useSettingsData';
import { useChildData } from './useChildData';
import { useLessonData } from './useLessonData';

export const useAppData = () => {
    const { user, loading: authLoading } = useAuth();

    // 1. Settings state & handlers
    const {
        adminAvatar, adminColor, adminName, adminDob, parentEmailInput,
        loadingSettings, setAdminAvatar, setAdminName, setAdminDob,
        setAdminColor, setParentEmailInput, saveSettings
    } = useSettingsData(user, authLoading);

    // 2. Child & Profile data state & handlers
    const {
        data, loading, childProfile, allChildren, parentUid, isDemoMode,
        setData, setChildProfile, handleAddChild, handleDeleteChild,
        handleUpdateChild, handleUpdateChildProfile,
        handleAddYearGroup, handleRemoveYearGroup
    } = useChildData(user, authLoading);

    // 3. Lesson & Import handlers
    const {
        handleBulkImport, handleTemplateImport, handleCompleteLesson,
        handleDeleteSubject, handleAddLesson, handleRestoreLesson,
        handleHardDeleteLesson, handleSoftDeleteLesson, handleUpdateTopicFrequency
    } = useLessonData(user, setData);

    // 4. Derived helpers (preserving functionality)
    const getChildById = (id: string) => data.find(c => c.id === id);

    const getYearGroupById = (childId: string, ygId: string) => {
        const child = getChildById(childId);
        return child?.yearGroups.find(yg => yg.id === ygId);
    };

    const getSubjectById = (childId: string, subId: string) => {
        const child = getChildById(childId);
        for (const yg of child?.yearGroups || []) {
            const sub = yg.subjects.find(s => s.id === subId);
            if (sub) return sub;
        }
        return undefined;
    };

    const getTopicById = (childId: string, subId: string, topicId: string) => {
        const sub = getSubjectById(childId, subId);
        return sub?.topics.find(t => t.id === topicId);
    };

    const getLessonById = (childId: string, subId: string, topicId: string, lessonId: string) => {
        const topic = getTopicById(childId, subId, topicId);
        return topic?.lessons.find(l => l.id === lessonId);
    };

    return {
        // State
        data,
        loading: loading || authLoading || loadingSettings,
        childProfile,
        allChildren,
        parentUid,
        isDemoMode,
        adminAvatar,
        adminName,
        adminDob,
        adminColor,
        parentEmailInput,

        // Profile Handlers
        handleAddChild,
        handleDeleteChild,
        handleUpdateChild,
        handleUpdateChildProfile,
        handleAddYearGroup,
        handleRemoveYearGroup,
        setChildProfile,
        setData,

        // Settings Handlers
        setAdminAvatar,
        setAdminName,
        setAdminDob,
        setAdminColor,
        setParentEmailInput,
        saveSettings,

        // Lesson Handlers
        handleCompleteLesson,
        handleDeleteSubject,
        handleAddLesson,
        handleRestoreLesson,
        handleHardDeleteLesson,
        handleSoftDeleteLesson,
        handleUpdateTopicFrequency,

        // Import Handlers
        handleBulkImport,
        handleTemplateImport,

        // Helper Methods
        getChildById,
        getYearGroupById,
        getSubjectById,
        getTopicById,
        getLessonById,
    };
};
