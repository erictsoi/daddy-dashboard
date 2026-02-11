import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { ChildProfile, YearGroup, Subject, Topic, Lesson } from '../../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabase) {
  console.warn('Supabase client not initialized - missing environment variables')
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }
  return supabase
}

export function generateChildId(): string {
  return crypto.randomUUID()
}

export function generateYearGroupId(childId: string, yearName: string): string {
  return `${childId}-${yearName.replace(/\s+/g, '-')}`
}

export function generateSubjectId(yearGroupId: string, subjectName: string): string {
  return `${yearGroupId}-${subjectName.replace(/\s+/g, '-')}`
}

export function generateTopicId(subjectId: string, topicName: string): string {
  return `${subjectId}-${topicName.replace(/\s+/g, '-')}`
}

export async function getChildren(userId: string): Promise<ChildProfile[]> {
  const client = getSupabase()
  const { data, error } = await client
    .from('children')
    .select(`
      *,
      year_groups (
        *,
        subjects (
          *,
          topics (
            *,
            lessons (*)
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at')

  if (error) {
    console.error('Error fetching children:', error)
    throw error
  }

  if (!data || data.length === 0) return []

  return data.map((child: any) => transformChild(child))
}

function transformChild(child: any): ChildProfile {
  return {
    id: child.id,
    name: child.name,
    avatar: child.avatar,
    themeColor: child.theme_color,
    dob: child.dob || '',
    yearGroups: (child.year_groups || []).map(transformYearGroup)
  }
}

function transformYearGroup(yg: any): YearGroup {
  return {
    id: yg.id,
    name: yg.name,
    subjects: (yg.subjects || []).map(transformSubject)
  }
}

function transformSubject(sub: any): Subject {
  return {
    id: sub.id,
    name: sub.name,
    category: sub.category,
    color: sub.color,
    topics: (sub.topics || []).map(transformTopic)
  }
}

function transformTopic(topic: any): Topic {
  return {
    id: topic.id,
    name: topic.name,
    lessons: (topic.lessons || []).map(transformLesson)
  }
}

function transformLesson(l: any): Lesson {
  return {
    id: l.id,
    title: l.title,
    videoUrl: l.video_url || undefined,
    completed: l.completed,
    timeSpentSeconds: l.time_spent_seconds || 0,
    orderIndex: l.order_index || 0
  }
}

export async function createChild(
  userId: string,
  name: string,
  avatar: string = '👶',
  themeColor: string = 'blue',
  dob?: string
): Promise<ChildProfile> {
  const client = getSupabase()
  const id = generateChildId()

  const { error } = await client
    .from('children')
    .insert({
      id,
      user_id: userId,
      name,
      avatar,
      theme_color: themeColor,
      dob
    })

  if (error) {
    console.error('Error creating child:', error)
    throw error
  }

  return {
    id,
    name,
    avatar,
    themeColor,
    dob: dob || '',
    yearGroups: []
  }
}

export async function updateChild(child: ChildProfile): Promise<void> {
  const client = getSupabase()

  const { error } = await client
    .from('children')
    .update({
      name: child.name,
      avatar: child.avatar,
      theme_color: child.themeColor,
      dob: child.dob
    })
    .eq('id', child.id)

  if (error) {
    console.error('Error updating child:', error)
    throw error
  }
}

export async function deleteChild(childId: string): Promise<void> {
  const client = getSupabase()

  const { error } = await client
    .from('children')
    .delete()
    .eq('id', childId)

  if (error) {
    console.error('Error deleting child:', error)
    throw error
  }
}

export async function createYearGroup(
  childId: string,
  yearName: string
): Promise<YearGroup> {
  const client = getSupabase()
  const id = generateYearGroupId(childId, yearName)

  const { error } = await client
    .from('year_groups')
    .insert({
      id,
      child_id: childId,
      name: yearName
    })

  if (error) {
    console.error('Error creating year group:', error)
    throw error
  }

  return {
    id,
    name: yearName,
    subjects: []
  }
}

export async function createSubject(
  yearGroupId: string,
  subjectName: string,
  category?: string,
  color?: string
): Promise<Subject> {
  const client = getSupabase()
  const id = generateSubjectId(yearGroupId, subjectName)

  const { error } = await client
    .from('subjects')
    .insert({
      id,
      year_group_id: yearGroupId,
      name: subjectName,
      category: category || 'Other',
      color: color || 'bg-gray-100 text-gray-800'
    })

  if (error) {
    console.error('Error creating subject:', error)
    throw error
  }

  return {
    id,
    name: subjectName,
    category: category || 'Other',
    color: color || 'bg-gray-100 text-gray-800',
    topics: []
  }
}

export async function createTopic(
  subjectId: string,
  topicName: string
): Promise<Topic> {
  const client = getSupabase()
  const id = generateTopicId(subjectId, topicName)

  const { error } = await client
    .from('topics')
    .insert({
      id,
      subject_id: subjectId,
      name: topicName
    })

  if (error) {
    console.error('Error creating topic:', error)
    throw error
  }

  return {
    id,
    name: topicName,
    lessons: []
  }
}

export async function createLesson(
  topicId: string,
  userId: string,
  title: string,
  videoUrl?: string,
  orderIndex: number = 0
): Promise<Lesson> {
  const client = getSupabase()
  const id = crypto.randomUUID()

  const { error } = await client
    .from('lessons')
    .insert({
      id,
      topic_id: topicId,
      user_id: userId,
      title,
      video_url: videoUrl,
      order_index: orderIndex
    })

  if (error) {
    console.error('Error creating lesson:', error)
    throw error
  }

  return {
    id,
    title,
    videoUrl,
    completed: false,
    timeSpentSeconds: 0,
    orderIndex
  }
}

export async function updateLesson(lesson: Lesson): Promise<void> {
  const client = getSupabase()

  const { error } = await client
    .from('lessons')
    .update({
      title: lesson.title,
      video_url: lesson.videoUrl,
      completed: lesson.completed,
      time_spent_seconds: lesson.timeSpentSeconds,
      order_index: lesson.orderIndex
    })
    .eq('id', lesson.id)

  if (error) {
    console.error('Error updating lesson:', error)
    throw error
  }
}

export async function markLessonComplete(
  lessonId: string,
  completed: boolean
): Promise<void> {
  const client = getSupabase()

  const { error } = await client
    .from('lessons')
    .update({ completed })
    .eq('id', lessonId)

  if (error) {
    console.error('Error marking lesson complete:', error)
    throw error
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const client = getSupabase()

  const { error } = await client
    .from('lessons')
    .delete()
    .eq('id', lessonId)

  if (error) {
    console.error('Error deleting lesson:', error)
    throw error
  }
}

export interface ImportRow {
  childName: string
  yearGroup: string
  subjectCategory: string
  subjectName: string
  topicName: string
  lessonTitle: string
  videoUrl?: string
}

export async function bulkImport(
  userId: string,
  rows: ImportRow[]
): Promise<{ success: number; errors: number }> {
  const client = getSupabase()
  let successCount = 0
  let errorCount = 0

  const childMap = new Map<string, string>()
  const yearGroupMap = new Map<string, string>()
  const subjectMap = new Map<string, string>()
  const topicMap = new Map<string, string>()

  for (const row of rows) {
    try {
      const childId = await getOrCreateChild(
        client,
        userId,
        row.childName,
        childMap
      )

      const yearGroupId = await getOrCreateYearGroup(
        client,
        childId,
        row.yearGroup,
        yearGroupMap
      )

      const subjectId = await getOrCreateSubject(
        client,
        yearGroupId,
        row.subjectName,
        row.subjectCategory,
        subjectMap
      )

      const topicId = await getOrCreateTopic(
        client,
        subjectId,
        row.topicName,
        topicMap
      )

      await createLesson(topicId, userId, row.lessonTitle, row.videoUrl)
      successCount++
    } catch (error) {
      console.error('Error importing row:', row, error)
      errorCount++
    }
  }

  return { success: successCount, errors: errorCount }
}

async function getOrCreateChild(
  client: SupabaseClient,
  userId: string,
  childName: string,
  cache: Map<string, string>
): Promise<string> {
  const cacheKey = `${userId}-${childName}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const { data: existing } = await client
    .from('children')
    .select('id')
    .eq('user_id', userId)
    .eq('name', childName)
    .single()

  if (existing) {
    cache.set(cacheKey, existing.id)
    return existing.id
  }

  const childId = generateChildId()
  await client.from('children').insert({
    id: childId,
    user_id: userId,
    name: childName,
    avatar: '👶',
    theme_color: 'blue'
  })

  cache.set(cacheKey, childId)
  return childId
}

async function getOrCreateYearGroup(
  client: SupabaseClient,
  childId: string,
  yearName: string,
  cache: Map<string, string>
): Promise<string> {
  const cacheKey = `${childId}-${yearName}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const id = generateYearGroupId(childId, yearName)

  const { error } = await client
    .from('year_groups')
    .upsert({
      id,
      child_id: childId,
      name: yearName
    })

  if (error) {
    console.error('Error creating year group:', error)
    throw error
  }

  cache.set(cacheKey, id)
  return id
}

async function getOrCreateSubject(
  client: SupabaseClient,
  yearGroupId: string,
  subjectName: string,
  category: string,
  cache: Map<string, string>
): Promise<string> {
  const cacheKey = `${yearGroupId}-${subjectName}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const id = generateSubjectId(yearGroupId, subjectName)

  const { error } = await client
    .from('subjects')
    .upsert({
      id,
      year_group_id: yearGroupId,
      name: subjectName,
      category: category || 'Other'
    })

  if (error) {
    console.error('Error creating subject:', error)
    throw error
  }

  cache.set(cacheKey, id)
  return id
}

async function getOrCreateTopic(
  client: SupabaseClient,
  subjectId: string,
  topicName: string,
  cache: Map<string, string>
): Promise<string> {
  const cacheKey = `${subjectId}-${topicName}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const id = generateTopicId(subjectId, topicName)

  const { error } = await client
    .from('topics')
    .upsert({
      id,
      subject_id: subjectId,
      name: topicName
    })

  if (error) {
    console.error('Error creating topic:', error)
    throw error
  }

  cache.set(cacheKey, id)
  return id
}

export async function fetchPlaylistVideos(
  playlistUrl: string
): Promise<Array<{ title: string; videoId: string; thumbnail?: string }>> {
  const client = getSupabase()

  const { data, error } = await client.functions.invoke('get-playlist-videos', {
    body: { playlistUrl }
  })

  if (error) {
    console.error('Error fetching playlist:', error)
    throw new Error('Failed to fetch playlist videos')
  }

  return data?.videos || []
}

export async function saveFullCurriculum(userId: string, children: ChildProfile[]): Promise<void> {
  const client = getSupabase()

  if (!userId) {
    console.error('saveFullCurriculum: userId is missing!');
    throw new Error('User ID is required');
  }

  console.log('saveFullCurriculum: Starting with', children.length, 'children');

  for (const child of children) {
    const childId = child.id || crypto.randomUUID()
    console.log('Upserting child:', child.name, 'id:', childId);

    await client.from('children').upsert({
      id: childId,
      user_id: userId,
      name: child.name,
      avatar: child.avatar,
      theme_color: child.themeColor,
      dob: child.dob || null
    }).then(result => {
      if (result.error) console.error('Children insert error:', result.error);
    })

    for (const yg of child.yearGroups || []) {
      await client.from('year_groups').upsert({
        id: yg.id,
        user_id: userId,
        child_id: childId,
        name: yg.name
      })

      for (const subject of yg.subjects || []) {
        await client.from('subjects').upsert({
          id: subject.id,
          user_id: userId,
          year_group_id: yg.id,
          name: subject.name,
          category: subject.category,
          color: subject.color
        })

        for (const topic of subject.topics || []) {
          await client.from('topics').upsert({
            id: topic.id,
            user_id: userId,
            subject_id: subject.id,
            name: topic.name
          })

          for (const lesson of topic.lessons || []) {
            await client.from('lessons').upsert({
              id: lesson.id,
              user_id: userId,
              topic_id: topic.id,
              title: lesson.title,
              video_url: lesson.videoUrl || null,
              completed: lesson.completed,
              time_spent_seconds: lesson.timeSpentSeconds || 0,
              order_index: lesson.orderIndex || 0
            })
          }
        }
      }
    }
  }
}

export async function hardDeleteSubjectFromSupabase(topicId: string): Promise<void> {
  const client = getSupabase()
  await client.from('topics').delete().eq('id', topicId)
}

export async function uploadToSupabase(userId: string, data: ChildProfile[]): Promise<{ success: boolean; message: string }> {
  try {
    await saveFullCurriculum(userId, data)
    return { success: true, message: 'Synced to Supabase!' }
  } catch (error) {
    return { success: false, message: 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

export async function loadFromSupabase(userId: string): Promise<{ success: boolean; message: string; data: ChildProfile[] }> {
  try {
    const children = await getChildren(userId)
    return { success: true, message: 'Loaded from Supabase!', data: children }
  } catch (error) {
    return { success: false, message: 'Load failed: ' + (error instanceof Error ? error.message : 'Unknown error'), data: [] }
  }
}

export function saveLocalData(data: ChildProfile[]): void {
  localStorage.setItem('daddy_dashboard_data', JSON.stringify(data))
}

export function getLocalData(): ChildProfile[] {
  const stored = localStorage.getItem('daddy_dashboard_data')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}
