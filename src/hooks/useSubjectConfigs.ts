import { useState, useEffect } from 'react';
import { TopicFrequency, ProfileTemplate } from '../types';

export interface TopicCardInfo {
  title: string;
  videoCount: number;
  url: string;
}

export interface SubjectConfig {
  subject: string;
  focus: string;
  frequency: TopicFrequency;
  isCore: boolean;
  topicCards?: TopicCardInfo[];
}

const STORAGE_KEY = 'child_subject_configs';

export const useSubjectConfigs = () => {
  const [configs, setConfigs] = useState<Record<string, SubjectConfig[]>>(() => {
    // Clear all saved configs on init
    localStorage.removeItem(STORAGE_KEY);
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  }, [configs]);

  const getConfig = (childId: string): SubjectConfig[] => {
    return configs[childId] || [];
  };

  const setConfig = (childId: string, subjects: SubjectConfig[]) => {
    setConfigs(prev => ({ ...prev, [childId]: subjects }));
  };

  const addSubject = (childId: string, subject: SubjectConfig) => {
    setConfigs(prev => ({
      ...prev,
      [childId]: [...(prev[childId] || []), subject]
    }));
  };

  const removeSubject = (childId: string, subjectName: string) => {
    setConfigs(prev => ({
      ...prev,
      [childId]: (prev[childId] || []).filter(s => s.subject !== subjectName)
    }));
  };

  const updateFrequency = (childId: string, subjectName: string, frequency: TopicFrequency) => {
    setConfigs(prev => ({
      ...prev,
      [childId]: (prev[childId] || []).map(s => 
        s.subject === subjectName ? { ...s, frequency } : s
      )
    }));
  };

  const toggleCore = (childId: string, subjectName: string) => {
    setConfigs(prev => ({
      ...prev,
      [childId]: (prev[childId] || []).map(s => 
        s.subject === subjectName ? { ...s, isCore: !s.isCore } : s
      )
    }));
  };

  const clearConfigs = () => {
    setConfigs({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    configs,
    getConfig,
    setConfig,
    addSubject,
    removeSubject,
    updateFrequency,
    toggleCore,
    clearConfigs
  };
};
