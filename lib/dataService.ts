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

// Migrate old format (subjects with lessons) to new format (subjects with topics.lessons)
function migrateToTopicStructure(data: ChildProfile[]): ChildProfile[] {
  return data.map(child => migrateChildToTopicStructure(child));
}

function migrateChildToTopicStructure(child: ChildProfile): ChildProfile {
  return {
    ...child,
    yearGroups: (child.yearGroups || []).map(yg => ({
      ...yg,
      subjects: (yg.subjects || []).map(sub => {
        // Check if already has topics array with lessons
        if (Array.isArray((sub as any).topics) && (sub as any).topics.length > 0) {
          return sub;
        }
        // Migrate old format to new - extract lessons from old structure
        const existingLessons = Array.isArray((sub as any).lessons) ? (sub as any).lessons : [];
        return {
          ...sub,
          topics: [{
            id: `${sub.id}-topic`,
            name: sub.name && sub.name.includes(':') ? sub.name.split(':')[1].trim() : (sub.name || 'General'),
            lessons: existingLessons
          }]
        };
      })
    }))
  };
}

export { migrateChildToTopicStructure };

export const getLocalData = (): ChildProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
      return INITIAL_DATA
    }
    // Migrate old data format to new topic structure
    return migrateToTopicStructure(parsed)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA))
  return INITIAL_DATA
}

export const saveLocalData = (data: ChildProfile[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const updateChildGoogleEmail = async (childId: string, email: string): Promise<void> => {
  if (!supabase) return;
  await supabase
    .from('children')
    .update({ google_email: email, updated_at: new Date().toISOString() })
    .eq('id', childId);
}

// Save functions for Topic structure
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

  for (const topic of subject.topics) {
    await saveTopic(topic, subId)
  }
}

export const saveTopic = async (topic: { id: string; name: string; lessons: Lesson[] }, subjectId: string): Promise<void> => {
  console.log('Saving topic:', topic.name, topic.id);
  const topicId = ensureUuid(topic.id)
  const { error } = await supabase
    .from('topics')
    .upsert({
      id: topicId,
      subject_id: subjectId,
      name: topic.name,
      order_index: 0
    })

  if (error) {
    console.error('Error saving topic:', topic.name, error);
    throw error;
  }

  for (const lesson of topic.lessons) {
    await saveLesson(lesson, topicId)
  }
}

export const saveLesson = async (lesson: Lesson, topicId: string): Promise<void> => {
  console.log('Saving lesson:', lesson.title, lesson.id);
  const lesId = ensureUuid(lesson.id)
  const { error } = await supabase
    .from('lessons')
    .upsert({
      id: lesId,
      topic_id: topicId,
      title: lesson.title,
      video_url: lesson.videoUrl,
      duration_minutes: lesson.durationMinutes,
      outcomes: lesson.outcomes,
      completed: lesson.completed,
      time_spent_seconds: lesson.timeSpentSeconds || 0,
      deleted: lesson.deleted || false,
      order_index: 0,
      lesson_focus: lesson.lessonFocus || null,
      lesson_notes: lesson.lessonNotes || null,
      video_position: lesson.videoPosition || null
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

// Fetch functions
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
  
  const topicsResult = await supabase
    .from('topics')
    .select('*')
    .in('subject_id', subjectIds)
    .order('order_index')
    
  if (topicsResult.error) throw topicsResult.error
  const topics = topicsResult.data || [];

  const topicIds = topics.map(t => t.id);
  
  const lessonsResult = await supabase
    .from('lessons')
    .select('*')
    .in('topic_id', topicIds)
    .order('order_index')
    
  if (lessonsResult.error) throw lessonsResult.error
  const lessons = lessonsResult.data || [];

  const topicsBySubject = new Map<string, typeof topics>();
  const lessonsByTopic = new Map<string, typeof lessons>();

  for (const topic of topics) {
    const list = topicsBySubject.get(topic.subject_id) || [];
    list.push(topic);
    topicsBySubject.set(topic.subject_id, list);
  }

  for (const lesson of lessons) {
    const list = lessonsByTopic.get(lesson.topic_id) || [];
    list.push(lesson);
    lessonsByTopic.set(lesson.topic_id, list);
  }

  const subjectsByYG = new Map<string, typeof subjects>();
  for (const sub of subjects) {
    const list = subjectsByYG.get(sub.year_group_id) || [];
    list.push(sub);
    subjectsByYG.set(sub.year_group_id, list);
  }

  const yearGroupsByChild = new Map<string, typeof yearGroups>();
  for (const yg of yearGroups) {
    const list = yearGroupsByChild.get(yg.child_id) || [];
    list.push(yg);
    yearGroupsByChild.set(yg.child_id, list);
  }

  const childrenWithData: ChildProfile[] = []

  for (const child of children) {
    const childYearGroups = yearGroupsByChild.get(child.id) || [];
    const yearGroupsWithSubjects: any[] = []

    for (const yg of childYearGroups) {
      const ygSubjects = subjectsByYG.get(yg.id) || [];
      const subjectsWithTopics: any[] = []

      for (const sub of ygSubjects) {
        const subTopics = topicsBySubject.get(sub.id) || [];
        const topicsWithLessons: any[] = []

        for (const topic of subTopics) {
          const topicLessons = lessonsByTopic.get(topic.id) || [];
          topicsWithLessons.push({
            id: topic.id,
            name: topic.name,
            lessons: topicLessons.map((l: any) => ({
              id: l.id,
              title: l.title,
              durationMinutes: l.duration_minutes,
              completed: l.completed,
              videoUrl: l.video_url || undefined,
              outcomes: l.outcomes || [],
              deleted: l.deleted,
              timeSpentSeconds: l.time_spent_seconds || undefined,
              lessonFocus: l.lesson_focus || undefined,
              lessonNotes: l.lesson_notes || undefined,
              videoPosition: l.video_position || undefined
            }))
          })
        }

        subjectsWithTopics.push({
          id: sub.id,
          name: sub.name,
          category: sub.category as any,
          color: sub.color,
          topics: topicsWithLessons
        })
      }

      yearGroupsWithSubjects.push({
        id: yg.id,
        name: yg.name,
        subjects: subjectsWithTopics
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

// Manual upload
export const uploadToSupabase = async (userId: string): Promise<{ success: boolean; message: string }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured' };
  }

  try {
    const localData = getLocalData();
    if (localData.length === 0) {
      return { success: false, message: 'No local data to upload' };
    }

    console.log('Manual upload: Starting upload to Supabase for user:', userId);

    for (const child of localData) {
      const childId = ensureUuid(child.id);
      
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
        });

      if (childError) {
        console.error('Error uploading child:', childError);
        continue;
      }

      for (const yg of child.yearGroups) {
        const ygId = ensureUuid(yg.id);
        const { error: ygError } = await supabase
          .from('year_groups')
          .upsert({
            id: ygId,
            child_id: childId,
            name: yg.name,
            order_index: parseInt(yg.name.replace(/[^0-9]/g, '')) || 0
          });

        if (ygError) {
          console.error('Error uploading year group:', ygError);
          continue;
        }

        for (const sub of yg.subjects) {
          const subId = ensureUuid(sub.id);
          const { error: subError } = await supabase
            .from('subjects')
            .upsert({
              id: subId,
              year_group_id: ygId,
              name: sub.name,
              category: sub.category,
              color: sub.color,
              order_index: 0
            });

          if (subError) {
            console.error('Error uploading subject:', subError);
            continue;
          }

          for (const topic of sub.topics) {
            const topicId = ensureUuid(topic.id);
            const { error: topicError } = await supabase
              .from('topics')
              .upsert({
                id: topicId,
                subject_id: subId,
                name: topic.name,
                order_index: 0
              });

            if (topicError) {
              console.error('Error uploading topic:', topicError);
              continue;
            }

            for (const lesson of topic.lessons) {
              const lesId = ensureUuid(lesson.id);
              const { error: lesError } = await supabase
                .from('lessons')
                .upsert({
                  id: lesId,
                  topic_id: topicId,
                  title: lesson.title,
                  video_url: lesson.videoUrl,
                  duration_minutes: lesson.durationMinutes,
                  outcomes: lesson.outcomes,
                  completed: lesson.completed,
                  time_spent_seconds: lesson.timeSpentSeconds || 0,
                  deleted: lesson.deleted || false,
                  order_index: 0,
                  lesson_focus: lesson.lessonFocus || null,
                  lesson_notes: lesson.lessonNotes || null,
                  video_position: lesson.videoPosition || null
                });

              if (lesError) {
                console.error('Error uploading lesson:', lesError);
              }
            }
          }
        }
      }
    }

    console.log('Manual upload: Complete');
    return { success: true, message: `Uploaded ${localData.length} children to Supabase` };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Manual load
export const loadFromSupabase = async (userId: string): Promise<{ success: boolean; message: string; data?: ChildProfile[] }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured' };
  }

  try {
    const children = await fetchChildren(userId);
    if (children.length === 0) {
      return { success: false, message: 'No data found in Supabase' };
    }
    return { success: true, message: `Loaded ${children.length} children from Supabase`, data: children };
  } catch (error) {
    console.error('Load error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Load failed' };
  }
}

// Fetch child by email
export const fetchChildByEmail = async (email: string): Promise<ChildProfile[]> => {
  if (!supabase) return [];
  
  const { data: children, error } = await supabase
    .from('children')
    .select('*')
    .eq('google_email', email)
    .order('order_index');

  if (error || !children || children.length === 0) return [];
  
  const childIds = children.map(c => c.id);
  
  // Fetch related data for these children
  const yearGroupsResult = await supabase
    .from('year_groups')
    .select('*')
    .in('child_id', childIds)
    .order('order_index');
    
  if (yearGroupsResult.error) return [];
  const yearGroups = yearGroupsResult.data || [];
  const yearGroupIds = yearGroups.map(yg => yg.id);
  
  const subjectsResult = await supabase
    .from('subjects')
    .select('*')
    .in('year_group_id', yearGroupIds)
    .order('order_index');
    
  if (subjectsResult.error) return [];
  const subjects = subjectsResult.data || [];
  const subjectIds = subjects.map(s => s.id);
  
  const topicsResult = await supabase
    .from('topics')
    .select('*')
    .in('subject_id', subjectIds)
    .order('order_index');
    
  if (topicsResult.error) return [];
  const topics = topicsResult.data || [];
  const topicIds = topics.map(t => t.id);
  
  const lessonsResult = await supabase
    .from('lessons')
    .select('*')
    .in('topic_id', topicIds)
    .order('order_index');
    
  if (lessonsResult.error) return [];
  const lessons = lessonsResult.data || [];

  // Build hierarchy
  const childrenWithData: ChildProfile[] = children.map((child: any) => {
    const childYearGroups = yearGroups.filter((yg: any) => yg.child_id === child.id);
    const yearGroupsWithSubjects = childYearGroups.map((yg: any) => {
      const ygSubjects = subjects.filter((s: any) => s.year_group_id === yg.id);
      const subjectsWithTopics = ygSubjects.map((s: any) => {
        const sTopics = topics.filter((t: any) => t.subject_id === s.id);
        const topicsWithLessons = sTopics.map((t: any) => ({
          id: t.id,
          name: t.name,
          lessons: lessons
            .filter((l: any) => l.topic_id === t.id)
            .map((l: any) => ({
              id: l.id,
              title: l.title,
              durationMinutes: l.duration_minutes,
              completed: l.completed,
              videoUrl: l.video_url || undefined,
              outcomes: l.outcomes || [],
              deleted: l.deleted,
              timeSpentSeconds: l.time_spent_seconds || undefined,
              lessonFocus: l.lesson_focus || undefined,
              lessonNotes: l.lesson_notes || undefined,
              videoPosition: l.video_position || undefined
            }))
        }));
        return {
          id: s.id,
          name: s.name,
          category: s.category,
          color: s.color,
          topics: topicsWithLessons
        };
      });
      return {
        id: yg.id,
        name: yg.name,
        subjects: subjectsWithTopics
      };
    });
    return {
      id: child.id,
      name: child.name,
      dob: child.dob || '',
      avatar: child.avatar,
      themeColor: child.theme_color,
      yearGroups: yearGroupsWithSubjects
    };
  });

  return childrenWithData;
};

// Soft delete lesson (mark as deleted)
export const softDeleteLessonInSupabase = async (lessonId: string): Promise<void> => {
  if (!supabase) return;
  await supabase
    .from('lessons')
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq('id', lessonId);
};

// Restore lesson (unmark deleted)
export const restoreLessonInSupabase = async (lessonId: string): Promise<void> => {
  if (!supabase) return;
  await supabase
    .from('lessons')
    .update({ deleted: false, updated_at: new Date().toISOString() })
    .eq('id', lessonId);
};

// Hard delete lesson (permanently remove)
export const hardDeleteLessonFromSupabase = async (lessonId: string): Promise<void> => {
  if (!supabase) return;
  await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);
};

// Hard delete subject (permanently remove)
export const hardDeleteSubjectFromSupabase = async (subjectId: string): Promise<void> => {
  if (!supabase) return;
  await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId);
}
