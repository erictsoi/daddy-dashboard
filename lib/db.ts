import { supabase } from '../lib/supabase';
import { DbChild, DbYearGroup, DbSubject, DbLesson } from '../types';

// Child Operations
export const childOps = {
  async create(child: Omit<DbChild, 'id' | 'created_at' | 'updated_at'>): Promise<DbChild | null> {
    const { data, error } = await supabase
      .from('children')
      .insert(child)
      .select()
      .single();

    if (error) {
      console.error('Error creating child:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<DbChild>): Promise<boolean> {
    const { error } = await supabase
      .from('children')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id);

    return !error;
  },

  async getById(id: string): Promise<DbChild | null> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .single();

    return error ? null : data;
  },
};

// Year Group Operations
export const yearGroupOps = {
  async create(yearGroup: Omit<DbYearGroup, 'id' | 'created_at'>): Promise<DbYearGroup | null> {
    const { data, error } = await supabase
      .from('year_groups')
      .insert(yearGroup)
      .select()
      .single();

    if (error) {
      console.error('Error creating year group:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('year_groups')
      .delete()
      .eq('id', id);

    return !error;
  },

  async getByChildId(childId: string): Promise<DbYearGroup[]> {
    const { data, error } = await supabase
      .from('year_groups')
      .select('*')
      .eq('child_id', childId)
      .order('order_index');

    return error ? [] : data || [];
  },
};

// Subject Operations
export const subjectOps = {
  async create(subject: Omit<DbSubject, 'id' | 'created_at'>): Promise<DbSubject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<DbSubject>): Promise<boolean> {
    const { error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id);

    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    return !error;
  },

  async getByYearGroupId(yearGroupId: string): Promise<DbSubject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('year_group_id', yearGroupId)
      .order('order_index');

    return error ? [] : data || [];
  },
};

// Lesson Operations
export const lessonOps = {
  async create(lesson: Omit<DbLesson, 'id' | 'created_at' | 'updated_at'>): Promise<DbLesson | null> {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lesson)
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return null;
    }
    return data;
  },

  async createMany(lessons: Omit<DbLesson, 'id' | 'created_at' | 'updated_at'>[]): Promise<DbLesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessons)
      .select();

    if (error) {
      console.error('Error creating lessons:', error);
      return [];
    }
    return data || [];
  },

  async update(id: string, updates: Partial<DbLesson>): Promise<boolean> {
    const { error } = await supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  },

  async markComplete(id: string, completed: boolean): Promise<boolean> {
    return lessonOps.update(id, { completed });
  },

  async updateTimeSpent(id: string, seconds: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('lessons')
      .select('time_spent_seconds')
      .eq('id', id)
      .single();

    if (error) return false;

    const newTotal = (data?.time_spent_seconds || 0) + seconds;
    return lessonOps.update(id, { time_spent_seconds: newTotal });
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    return !error;
  },

  async softDelete(id: string): Promise<boolean> {
    return lessonOps.update(id, { deleted: true });
  },

  async getBySubjectId(subjectId: string): Promise<DbLesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('deleted', false)
      .order('order_index');

    return error ? [] : data || [];
  },
};

// Full Curriculum Fetch
export interface FullCurriculum {
  child: DbChild;
  yearGroups: (DbYearGroup & {
    subjects: (DbSubject & { lessons: DbLesson[] })[];
  })[];
}

export const getFullCurriculum = async (childId: string): Promise<FullCurriculum | null> => {
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (childError || !child) return null;

  const { data: yearGroups, error: ygError } = await supabase
    .from('year_groups')
    .select('*')
    .eq('child_id', childId)
    .order('order_index');

  if (ygError) return null;

  const yearGroupsWithSubjects = await Promise.all(
    (yearGroups || []).map(async (yg) => {
      const { data: subjects, error: sError } = await supabase
        .from('subjects')
        .select('*')
        .eq('year_group_id', yg.id)
        .order('order_index');

      if (sError) return { ...yg, subjects: [] };

      const subjectsWithLessons = await Promise.all(
        (subjects || []).map(async (s) => {
          const { data: lessons, error: lError } = await supabase
            .from('lessons')
            .select('*')
            .eq('subject_id', s.id)
            .eq('deleted', false)
            .order('order_index');

          return {
            ...s,
            lessons: lError ? [] : (lessons || []),
          };
        })
      );

      return { ...yg, subjects: subjectsWithLessons };
    })
  );

  return {
    child,
    yearGroups: yearGroupsWithSubjects,
  };
};
