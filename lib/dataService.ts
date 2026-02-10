import { supabase } from './supabase'
import { ChildProfile, YearGroup, Subject, Lesson } from '../types'
import { INITIAL_DATA } from '../constants'

const STORAGE_KEY = 'daddy_dashboard_data'

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function ensureUuid(id: string): string {
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return id
  }
  return generateUuid()
}

function formatDateForSupabase(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

export const getLocalData = (): ChildProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    // If stored data is empty, fall back to defaults
    if (parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
      return INITIAL_DATA
    }
    return parsed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
  return INITIAL_DATA
}

export const saveLocalData = (data: ChildProfile[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Sync localStorage data to Supabase when user signs in
export const syncLocalDataToSupabase = async (userId: string): Promise<void> => {
  const localData = getLocalData()
  if (localData.length === 0) return

  // Check if user already has children in Supabase
  const { data: existingChildren, error: checkError } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (checkError) {
    console.error('Error checking existing children:', checkError);
  } else if (existingChildren && existingChildren.length > 0) {
    console.log('User already has children in Supabase, skipping sync');
    return
  }

  console.log('Syncing', localData.length, 'children from localStorage to Supabase');

  for (const child of localData) {
    const childId = ensureUuid(child.id)
    
    // Upsert child
    const { error: childError } = await supabase
      .from('children')
      .upsert({
        id: childId,
        user_id: userId,
        name: child.name,
        avatar: child.avatar,
        theme_color: child.themeColor,
        dob: formatDateForSupabase(child.dob),
        order_index: 0
      })

    if (childError) {
      console.error('Error syncing child:', childError)
      continue
    }

    // Upsert year groups, subjects, and lessons
    for (const yg of child.yearGroups) {
      const ygId = ensureUuid(yg.id)
      const { error: ygError } = await supabase
        .from('year_groups')
        .upsert({
          id: ygId,
          child_id: childId,
          name: yg.name,
          order_index: parseInt(yg.name.replace(/[^0-9]/g, '')) || 0
        })

      if (ygError) {
        console.error('Error syncing year group:', ygError)
        continue
      }

      for (const sub of yg.subjects) {
        const subId = ensureUuid(sub.id)
        const { error: subError } = await supabase
          .from('subjects')
          .upsert({
            id: subId,
            year_group_id: ygId,
            name: sub.name,
            category: sub.category,
            color: sub.color,
            order_index: 0
          })

        if (subError) {
          console.error('Error syncing subject:', subError)
          continue
        }

        for (const lesson of sub.lessons) {
          const lesId = ensureUuid(lesson.id)
          const { error: lesError } = await supabase
            .from('lessons')
            .upsert({
              id: lesId,
              subject_id: subId,
              title: lesson.title,
              video_url: lesson.videoUrl,
              duration_minutes: lesson.durationMinutes,
              outcomes: lesson.outcomes,
              completed: lesson.completed,
              time_spent_seconds: lesson.timeSpentSeconds || 0,
              deleted: lesson.deleted || false,
              order_index: 0
            })

          if (lesError) {
            console.error('Error syncing lesson:', lesError)
          }
        }
      }
    }
  }

  console.log('Local data synced to Supabase')
}

export const fetchChildren = async (userId: string): Promise<ChildProfile[]> => {
  console.log('fetchChildren: loading for userId', userId);
  
  const { data: children, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('order_index')

  if (error) {
    console.error('fetchChildren error:', error);
    throw error;
  }
  
  console.log('fetchChildren: found', children?.length || 0, 'children for userId', userId);
  if (!children || children.length === 0) return []

  // Fetch all related data in parallel for better performance
  const childIds = children.map(c => c.id);
  
  const yearGroupsResult = await supabase
    .from('year_groups')
    .select('*')
    .in('child_id', childIds)
    .order('order_index')
    
  if (yearGroupsResult.error) throw yearGroupsResult.error
  const yearGroups = yearGroupsResult.data || [];

  const yearGroupIds = yearGroups.map(yg => yg.id);
  
  const subjectsResult = await supabase
    .from('subjects')
    .select('*')
    .in('year_group_id', yearGroupIds)
    .order('order_index')
    
  if (subjectsResult.error) throw subjectsResult.error
  const subjects = subjectsResult.data || [];

  const subjectIds = subjects.map(s => s.id);
  
  const lessonsResult = await supabase
    .from('lessons')
    .select('*')
    .in('subject_id', subjectIds)
    .order('order_index')
    
  if (lessonsResult.error) throw lessonsResult.error
  const lessons = lessonsResult.data || [];

  // Build the tree in memory
  const yearGroupsByChild = new Map<string, typeof yearGroups>();
  const subjectsByYG = new Map<string, typeof subjects>();
  const lessonsBySubject = new Map<string, typeof lessons>();

  for (const yg of yearGroups) {
    const list = yearGroupsByChild.get(yg.child_id) || [];
    list.push(yg);
    yearGroupsByChild.set(yg.child_id, list);
  }

  for (const sub of subjects) {
    const list = subjectsByYG.get(sub.year_group_id) || [];
    list.push(sub);
    subjectsByYG.set(sub.year_group_id, list);
  }

  for (const lesson of lessons) {
    const list = lessonsBySubject.get(lesson.subject_id) || [];
    list.push(lesson);
    lessonsBySubject.set(lesson.subject_id, list);
  }

  const childrenWithData: ChildProfile[] = []

  for (const child of children) {
    const childYearGroups = yearGroupsByChild.get(child.id) || [];
    const yearGroupsWithSubjects: YearGroup[] = []

    for (const yg of childYearGroups) {
      const ygSubjects = subjectsByYG.get(yg.id) || [];
      const subjectsWithLessons: Subject[] = []

      for (const sub of ygSubjects) {
        const subLessons = lessonsBySubject.get(sub.id) || [];
        subjectsWithLessons.push({
          id: sub.id,
          name: sub.name,
          category: sub.category as any,
          color: sub.color,
          lessons: subLessons.map(l => ({
            id: l.id,
            title: l.title,
            durationMinutes: l.duration_minutes,
            completed: l.completed,
            videoUrl: l.video_url || undefined,
            outcomes: l.outcomes || [],
            deleted: l.deleted,
            timeSpentSeconds: l.time_spent_seconds || undefined
          }))
        })
      }

      yearGroupsWithSubjects.push({
        id: yg.id,
        name: yg.name,
        subjects: subjectsWithLessons
      })
    }

    childrenWithData.push({
      id: child.id,
      name: child.name,
      dob: child.dob || '',
      avatar: child.avatar,
      themeColor: child.theme_color,
      yearGroups: yearGroupsWithSubjects
    })
  }

  console.log('fetchChildren: returning', childrenWithData.length, 'children with full data');
  return childrenWithData
}

export const fetchChildByEmail = async (googleEmail: string): Promise<ChildProfile | null> => {
  const { data: child, error } = await supabase
    .from('children')
    .select('*')
    .eq('google_email', googleEmail.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  if (!child) return null

  // Fetch full child data with all nested relations
  const { data: yearGroups, error: ygError } = await supabase
    .from('year_groups')
    .select('*')
    .eq('child_id', child.id)
    .order('order_index')

  if (ygError) throw ygError

  const yearGroupsWithSubjects: YearGroup[] = []

  for (const yg of yearGroups || []) {
    const { data: subjects, error: subError } = await supabase
      .from('subjects')
      .select('*')
      .eq('year_group_id', yg.id)
      .order('order_index')

    if (subError) throw subError

    const subjectsWithLessons: Subject[] = []

    for (const sub of subjects || []) {
      const { data: lessons, error: lesError } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', sub.id)
        .order('order_index')

      if (lesError) throw lesError

      subjectsWithLessons.push({
        id: sub.id,
        name: sub.name,
        category: sub.category as any,
        color: sub.color,
        lessons: (lessons || []).map(l => ({
          id: l.id,
          title: l.title,
          durationMinutes: l.duration_minutes,
          completed: l.completed,
          videoUrl: l.video_url || undefined,
          outcomes: l.outcomes || [],
          deleted: l.deleted,
          timeSpentSeconds: l.time_spent_seconds || undefined
        }))
      })
    }

    yearGroupsWithSubjects.push({
      id: yg.id,
      name: yg.name,
      subjects: subjectsWithLessons
    })
  }

  return {
    id: child.id,
    name: child.name,
    dob: child.dob || '',
    avatar: child.avatar,
    themeColor: child.theme_color,
    yearGroups: yearGroupsWithSubjects
  }
}

export const updateChildGoogleEmail = async (childId: string, googleEmail: string): Promise<void> => {
  const { error } = await supabase
    .from('children')
    .update({ google_email: googleEmail.toLowerCase() })
    .eq('id', childId)

  if (error) throw error
}

export const saveYearGroup = async (yearGroup: YearGroup, childId: string): Promise<void> => {
  console.log('Saving year group:', yearGroup.name, yearGroup.id);
  const ygId = ensureUuid(yearGroup.id)
  const { error } = await supabase
    .from('year_groups')
    .upsert({
      id: ygId,
      child_id: childId,
      name: yearGroup.name,
      order_index: parseInt(yearGroup.name.replace(/[^0-9]/g, '')) || 0
    })

  if (error) {
    console.error('Error saving year group:', yearGroup.name, error);
    throw error;
  }

  for (const subject of yearGroup.subjects) {
    await saveSubject(subject, ygId)
  }
}

export const saveSubject = async (subject: Subject, yearGroupId: string): Promise<void> => {
  console.log('Saving subject:', subject.name, subject.id);
  const subId = ensureUuid(subject.id)
  const { error } = await supabase
    .from('subjects')
    .upsert({
      id: subId,
      year_group_id: yearGroupId,
      name: subject.name,
      category: subject.category,
      color: subject.color,
      order_index: 0
    })

  if (error) {
    console.error('Error saving subject:', subject.name, error);
    throw error;
  }

  for (const lesson of subject.lessons) {
    await saveLesson(lesson, subId)
  }
}

export const saveLesson = async (lesson: Lesson, subjectId: string): Promise<void> => {
  console.log('Saving lesson:', lesson.title, lesson.id);
  const lesId = ensureUuid(lesson.id)
  const { error } = await supabase
    .from('lessons')
    .upsert({
      id: lesId,
      subject_id: subjectId,
      title: lesson.title,
      video_url: lesson.videoUrl,
      duration_minutes: lesson.durationMinutes,
      outcomes: lesson.outcomes,
      completed: lesson.completed,
      time_spent_seconds: lesson.timeSpentSeconds || 0,
      deleted: lesson.deleted || false,
      order_index: 0
    })

  if (error) {
    console.error('Error saving lesson:', lesson.title, error);
    throw error;
  }
}

export const saveFullCurriculum = async (children: ChildProfile[], userId: string): Promise<void> => {
  console.log('saveFullCurriculum: starting for', children.length, 'children, userId:', userId);
  for (const child of children) {
    console.log('Processing child:', child.name);
    const childId = ensureUuid(child.id)
    const { error: childError } = await supabase
      .from('children')
      .upsert({
        id: childId,
        user_id: userId,
        name: child.name,
        avatar: child.avatar,
        theme_color: child.themeColor,
        dob: formatDateForSupabase(child.dob),
        order_index: 0
      })

    if (childError) {
      console.error('Error saving child:', child.name, childError);
      throw childError;
    }

    for (const yg of child.yearGroups) {
      await saveYearGroup(yg, childId)
    }
  }
  console.log('saveFullCurriculum: complete');
}

export const hardDeleteLessonFromSupabase = async (lessonId: string): Promise<void> => {
  console.log('Hard deleting lesson from Supabase:', lessonId);
  if (!supabase) {
    console.warn('Supabase not configured, skipping hard delete');
    return;
  }
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    console.error('Error hard deleting lesson from Supabase:', error);
    throw error;
  }
  console.log('Lesson hard deleted from Supabase:', lessonId);
}

export const softDeleteLessonInSupabase = async (lessonId: string): Promise<void> => {
  console.log('Soft deleting lesson in Supabase:', lessonId);
  if (!supabase) {
    console.warn('Supabase not configured, skipping soft delete');
    return;
  }
  const { error } = await supabase
    .from('lessons')
    .update({ deleted: true })
    .eq('id', lessonId);

  if (error) {
    console.error('Error soft deleting lesson in Supabase:', error);
    throw error;
  }
  console.log('Lesson soft deleted in Supabase:', lessonId);
}

export const restoreLessonInSupabase = async (lessonId: string): Promise<void> => {
  console.log('Restoring lesson in Supabase:', lessonId);
  if (!supabase) {
    console.warn('Supabase not configured, skipping restore');
    return;
  }
  const { error } = await supabase
    .from('lessons')
    .update({ deleted: false })
    .eq('id', lessonId);

  if (error) {
    console.error('Error restoring lesson in Supabase:', error);
    throw error;
  }
  console.log('Lesson restored in Supabase:', lessonId);
}

export const hardDeleteSubjectFromSupabase = async (subjectId: string): Promise<void> => {
  console.log('Hard deleting subject from Supabase:', subjectId);
  if (!supabase) {
    console.warn('Supabase not configured, skipping hard delete');
    return;
  }
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId);

  if (error) {
    console.error('Error hard deleting subject from Supabase:', error);
    throw error;
  }
  console.log('Subject hard deleted from Supabase:', subjectId);
}

export const cleanupDuplicateLessons = async (childId: string): Promise<number> => {
  console.log('Cleaning up duplicate lessons for child:', childId);
  if (!supabase) {
    console.warn('Supabase not configured, skipping cleanup');
    return 0;
  }

  // Get all lessons for this child's subjects
  const { data: subjects, error: subError } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('child_id', childId);

  if (subError) {
    console.error('Error fetching subjects for cleanup:', subError);
    return 0;
  }

  if (!subjects || subjects.length === 0) {
    console.log('No subjects found for child');
    return 0;
  }

  let deletedCount = 0;

  for (const subject of subjects) {
    // Get all lessons for this subject
    const { data: lessons, error: lesError } = await supabase
      .from('lessons')
      .select('id, title, video_url, created_at')
      .eq('subject_id', subject.id)
      .order('created_at', { ascending: true });

    if (lesError) {
      console.error('Error fetching lessons for subject:', subject.name, lesError);
      continue;
    }

    if (!lessons || lessons.length === 0) continue;

    // Find duplicates by title
    const seenTitles = new Map<string, string>();
    const duplicates: string[] = [];

    for (const lesson of lessons) {
      const titleKey = lesson.title.toLowerCase().trim();
      if (seenTitles.has(titleKey)) {
        // This is a duplicate - keep the earliest one, delete others
        duplicates.push(lesson.id);
      } else {
        seenTitles.set(titleKey, lesson.id);
      }
    }

    // Delete duplicates
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate lessons in ${subject.name}`);
      const { error: delError } = await supabase
        .from('lessons')
        .delete()
        .in('id', duplicates);

      if (delError) {
        console.error('Error deleting duplicates:', delError);
      } else {
        deletedCount += duplicates.length;
        console.log(`Deleted ${duplicates.length} duplicate lessons from ${subject.name}`);
      }
    }
  }

  console.log(`Cleanup complete: deleted ${deletedCount} duplicate lessons`);
  return deletedCount;
}
