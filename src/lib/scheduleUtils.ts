import { TopicFrequency } from '../types';

export const STEM_SUBJECTS = ['Maths', 'Science', 'Physics', 'Technology', 'Computer Science', 'Design'];
export const CORE_SUBJECTS = ['Maths', 'English', 'Science'];

export type FrequencyMode = 'balanced' | 'stem' | 'arts';

export const frequencyToWeight = (freq?: TopicFrequency): number => {
  switch (freq) {
    case 'low': return 1;
    case 'high': return 3;
    case 'balanced':
    default:
      return 2;
  }
};

export interface SubjectFrequencyWeights {
  [subjectName: string]: TopicFrequency;
}

export interface ChildFrequencyModes {
  [childIndex: number]: FrequencyMode;
}

export const getSubjectWeight = (
  subjectName: string,
  childIndex: number,
  childFreqMode: FrequencyMode[],
  perSubjectWeightsMap: Record<number, SubjectFrequencyWeights> = {}
): number => {
  // First check for per-subject override for this specific child
  const perSubjectWeights = perSubjectWeightsMap[childIndex] || {};
  if (perSubjectWeights[subjectName]) {
    return frequencyToWeight(perSubjectWeights[subjectName]);
  }

  // Fall back to child-level mode
  const mode = childFreqMode[childIndex] || 'balanced';
  const isSTEM = STEM_SUBJECTS.some(s => subjectName.toLowerCase().includes(s.toLowerCase()));
  const isCore = CORE_SUBJECTS.some(s => subjectName.toLowerCase().includes(s.toLowerCase()));

  if (mode === 'balanced') return 2;
  if (mode === 'stem') return isSTEM ? 3 : 1;
  if (mode === 'arts') {
    if (isCore) return 2;
    return isSTEM ? 1 : 3;
  }
  return 2;
};
