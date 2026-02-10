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
  
  // First, let's check what children exist for this user
  const { data: allChildren, error: allError } = await supabase
    .from('children')
    .select('id, user_id, name')
  
  if (allError) {
    console.error('Error checking all children:', allError);
  } else {
    console.log('All children in DB:', allChildren);
  }
  
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

  const childrenWithData: ChildProfile[] = []

  for (const child of children) {
    console.log('Fetching year groups for child:', child.name);
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
      
      console.log(`  ${yg.name}: ${subjects?.length || 0} subjects`);
      const subjectsWithLessons: Subject[] = []

      for (const sub of subjects || []) {
        const { data: lessons, error: lesError } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', sub.id)
          .order('order_index')

        if (lesError) throw lesError
        
        console.log(`    ${sub.name}: ${lessons?.length || 0} lessons`);
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
