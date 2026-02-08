import { supabase } from './supabase'
import { ChildProfile, YearGroup, Subject, Lesson } from '../types'
import { INITIAL_DATA } from '../constants'

const STORAGE_KEY = 'daddy_dashboard_data'

export const getLocalData = (): ChildProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
  return INITIAL_DATA
}

export const saveLocalData = (data: ChildProfile[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const fetchChildren = async (userId: string): Promise<ChildProfile[]> => {
  const { data: children, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('order_index')

  if (error) throw error
  if (!children || children.length === 0) return []

  const childrenWithData: ChildProfile[] = []

  for (const child of children) {
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

    childrenWithData.push({
      id: child.id,
      name: child.name,
      dob: child.dob || '',
      avatar: child.avatar,
      themeColor: child.theme_color,
      yearGroups: yearGroupsWithSubjects
    })
  }

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

  const yearGroupsWithSubjects: YearGroup[] = []

  for (const yg of child.year_groups || []) {
    const subjectsWithLessons: Subject[] = []

    for (const sub of yg.subjects || []) {
      subjectsWithLessons.push({
        id: sub.id,
        name: sub.name,
        category: sub.category as any,
        color: sub.color,
        lessons: (sub.lessons || []).map(l => ({
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
