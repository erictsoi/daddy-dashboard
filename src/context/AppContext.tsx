import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useAppData } from '../hooks/useAppData';
import { ChildProfile, TopicFrequency, ParsedRow, ParsedTemplateRow } from '../types';

interface AppContextValue {
    children: ChildProfile[];
    loading: boolean;
    user: any; // Firebase User
    childProfile: ChildProfile | null;
    allChildren: { id: string; name: string; avatar: string; themeColor: string }[];
    isDemoMode: boolean;

    settings: {
        adminAvatar: string;
        adminColor: string;
        adminName: string;
        adminDob: string;
        parentEmailInput: string;
        parentUid: string;
    };

    setAdminAvatar: (avatar: string) => void;
    setAdminName: (name: string) => void;
    setAdminDob: (dob: string) => void;
    setAdminColor: (color: string) => void;
    setParentEmailInput: (email: string) => void;

    handleAddChild: (childData: Omit<ChildProfile, 'id' | 'yearGroups'>) => void;
    handleDeleteChild: (id: string) => void;
    handleUpdateChild: (id: string, updates: Partial<ChildProfile>) => void;
    handleUpdateChildProfile: (updates: Partial<ChildProfile>) => void;

    handleAddYearGroup: (childId: string, name: string) => void;
    handleRemoveYearGroup: (childId: string, yearGroupId: string) => void;

    handleCompleteLesson: (childId: string, subjectId: string, topicId: string, lessonId: string, timeSpentSeconds: number) => void;
    handleBulkImport: (rows: ParsedRow[]) => void;
    handleTemplateImport: (rows: ParsedTemplateRow[]) => void;
    handleDeleteSubject: (childId: string, subjectId: string) => void;

    handleAddLesson: (childId: string, subjectId: string, topicId: string, title: string) => void;
    handleRestoreLesson: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;
    handleHardDeleteLesson: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;
    handleSoftDeleteLesson: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;

    handleUpdateTopicFrequency: (childId: string, subjectId: string, topicId: string, frequency: TopicFrequency) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth() || {};
    const appData = useAppData();

    const value: AppContextValue = {
        children: appData.data,
        loading: appData.loading || !!authLoading,
        user,
        childProfile: appData.childProfile,
        allChildren: appData.allChildren,

        settings: {
            adminAvatar: appData.adminAvatar,
            adminColor: appData.adminColor,
            adminName: appData.adminName,
            adminDob: appData.adminDob,
            parentEmailInput: appData.parentEmailInput,
            parentUid: appData.parentUid,
        },
        isDemoMode: appData.isDemoMode,

        setAdminAvatar: appData.setAdminAvatar,
        setAdminName: appData.setAdminName,
        setAdminDob: appData.setAdminDob,
        setAdminColor: appData.setAdminColor,
        setParentEmailInput: appData.setParentEmailInput,

        handleAddChild: appData.handleAddChild,
        handleDeleteChild: appData.handleDeleteChild,
        handleUpdateChild: appData.handleUpdateChild,
        handleUpdateChildProfile: appData.handleUpdateChildProfile,

        handleAddYearGroup: appData.handleAddYearGroup,
        handleRemoveYearGroup: appData.handleRemoveYearGroup,

        handleCompleteLesson: appData.handleCompleteLesson,
        handleBulkImport: appData.handleBulkImport,
        handleTemplateImport: appData.handleTemplateImport,
        handleDeleteSubject: appData.handleDeleteSubject,

        handleAddLesson: appData.handleAddLesson,
        handleRestoreLesson: appData.handleRestoreLesson,
        handleHardDeleteLesson: appData.handleHardDeleteLesson,
        handleSoftDeleteLesson: appData.handleSoftDeleteLesson,

        handleUpdateTopicFrequency: appData.handleUpdateTopicFrequency,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
