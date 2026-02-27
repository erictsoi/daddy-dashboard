import React from 'react';
import { ChildProfile, YearGroup } from '../types';
import { saveFullCurriculum, saveLocalData } from './dataService';
import { logger } from './logger';
import { generateUuid } from './helpers';

export interface HandlerDeps {
  data: ChildProfile[];
  user: any;
  setData: React.Dispatch<React.SetStateAction<ChildProfile[]>>;
}

export const createHandlers = (deps: HandlerDeps) => {
  const { data, user, setData } = deps;

  const handleAddChild = (childData: Omit<ChildProfile, 'id' | 'yearGroups'>) => {
    const newChild: ChildProfile = {
      ...childData,
      id: generateUuid(),
      yearGroups: [],
    };
    setData(prev => {
      const newData = [...prev, newChild];
      if (user) {
        saveFullCurriculum(newData, user.uid).catch(logger.error);
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
        saveFullCurriculum(newData, user.uid).catch(logger.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  const handleUpdateChild = (id: string, updates: Partial<ChildProfile>) => {
    setData(prev => {
      const newData = prev.map(child =>
        child.id === id ? { ...child, ...updates } : child
      );
      if (user) {
        saveFullCurriculum(newData, user.uid).catch(logger.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  const handleAddYearGroup = (childId: string, name: string) => {
    const newYg: YearGroup = {
      id: generateUuid(),
      name,
      subjects: [],
    };
    setData(prev => {
      const newData = prev.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          yearGroups: [...child.yearGroups, newYg],
        };
      });
      if (user) {
        saveFullCurriculum(newData, user.uid).catch(logger.error);
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
        return {
          ...child,
          yearGroups: child.yearGroups.filter(yg => yg.id !== yearGroupId),
        };
      });
      if (user) {
        saveFullCurriculum(newData, user.uid).catch(logger.error);
      } else {
        saveLocalData(newData);
      }
      return newData;
    });
  };

  return {
    handleAddChild,
    handleDeleteChild,
    handleUpdateChild,
    handleAddYearGroup,
    handleRemoveYearGroup,
  };
};
