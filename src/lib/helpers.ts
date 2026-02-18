import { ChildProfile, YearGroup, Subject, Topic, Lesson } from '../../types';
import { saveFullCurriculum, saveLocalData } from './dataService';

export const findChildById = (data: ChildProfile[], childId: string): ChildProfile | undefined => {
  return data.find(c => c.id === childId);
};

export const findYearGroup = (child: ChildProfile | undefined, subjectId: string) => {
  if (!child) return undefined;
  return child.yearGroups.find(y => y.subjects.some(s => s.id === subjectId));
};

export const findSubject = (yearGroup: YearGroup | undefined, subjectId: string) => {
  return yearGroup?.subjects.find(s => s.id === subjectId);
};

export const findTopic = (subject: Subject | undefined, topicId: string) => {
  return subject?.topics.find(t => t.id === topicId);
};

export const findLesson = (topic: Topic | undefined, lessonId: string) => {
  return topic?.lessons.find(l => l.id === lessonId);
};

export const shallowClone = (obj: any): any => {
  return Array.isArray(obj) ? obj.slice() : { ...obj };
};

export const cloneWithPath = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) return value;
  
  const result = shallowClone(obj);
  let current: any = result;
  
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = shallowClone(current[path[i]]);
    current = current[path[i]];
  }
  
  current[path[path.length - 1]] = value;
  return result;
};

export const getGridCols = (count: number): string => {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
};

export const generateUuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const saveData = (data: ChildProfile[], user: any) => {
  if (user) {
    saveFullCurriculum(data, user.uid).catch(console.error);
  } else {
    saveLocalData(data);
  }
};

export const exportDataToFile = (data: ChildProfile[], filename: string = 'daddy-dashboard-export.json') => {
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

export const importDataFromFile = (file: File): Promise<ChildProfile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.children && Array.isArray(parsed.children)) {
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
                    id: generateUuid()
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
