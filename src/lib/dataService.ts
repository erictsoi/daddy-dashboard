import { supabase } from './supabase'
import { ChildProfile, YearGroup, Subject, Lesson } from '../../types'
import { INITIAL_DATA } from '../../constants'

const STORAGE_KEY = 'daddy_dashboard_data'

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function ensureUuid(id: string): string {
  // If already a valid UUID, keep it
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return id
  }
  // Generate a proper UUID for non-UUID IDs
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
  console.log('getLocalData: key=', STORAGE_KEY, 'has data=', !!stored);
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      console.log('getLocalData: parsed type=', typeof parsed, 'isArray=', Array.isArray(parsed), 'length=', parsed?.length);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Log first child's subjects to debug
        console.log('First child:', parsed[0]?.name, 'yearGroups:', parsed[0]?.yearGroups?.length);
        if (parsed[0]?.yearGroups?.[0]?.subjects) {
          console.log('Subjects:', parsed[0].yearGroups[0].subjects.map(s => ({ id: s.id, name: s.name, topics: s.topics?.length })));
        }
        return migrateToTopicStructure(parsed)
      }
    } catch (e) {
      console.error('Failed to parse localStorage:', e)
    }
  }
  return []
}

export const saveLocalData = (data: ChildProfile[]) => {
  console.log('saveLocalData: saving', data.length, 'children:', data.map(c => c.name));
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
export const saveYearGroup = async (yearGroup: YearGroup, childId: string, userId: string): Promise<void> => {
  console.log('Saving year group:', yearGroup.name, yearGroup.id);
  const ygId = ensureUuid(yearGroup.id)
  const { error } = await supabase
    .from('year_groups')
    .upsert({
      id: ygId,
      child_id: childId,
      user_id: userId,
      name: yearGroup.name,
      order_index: parseInt(yearGroup.name.replace(/[^0-9]/g, '')) || 0
    })

  if (error) {
    console.error('Error saving year group:', yearGroup.name, error);
    throw error;
  }

  for (const subject of yearGroup.subjects) {
    await saveSubject(subject, ygId, userId)
  }
}

export const saveSubject = async (subject: Subject, yearGroupId: string, userId: string): Promise<void> => {
  console.log('Saving subject:', subject.name, subject.id);
  const subId = ensureUuid(subject.id)
  const { error } = await supabase
    .from('subjects')
    .upsert({
      id: subId,
      year_group_id: yearGroupId,
      user_id: userId,
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
    await saveTopic(topic, subId, userId)
  }
}

export const saveTopic = async (topic: { id: string; name: string; lessons: Lesson[] }, subjectId: string, userId: string): Promise<void> => {
  console.log('Saving topic:', topic.name, topic.id);
  const topicId = ensureUuid(topic.id)
  const { error } = await supabase
    .from('topics')
    .upsert({
      id: topicId,
      subject_id: subjectId,
      user_id: userId,
      name: topic.name,
      order_index: 0
    })

  if (error) {
    console.error('Error saving topic:', topic.name, error);
    throw error;
  }
  // Lessons are saved in the second pass of saveFullCurriculum
}

export const saveLesson = async (lesson: Lesson, topicId: string, userId: string): Promise<void> => {
  console.log('Saving lesson:', lesson.title, lesson.id);
  const lesId = ensureUuid(lesson.id)
  const { error } = await supabase
    .from('lessons')
    .upsert({
      id: lesId,
      topic_id: topicId,
      user_id: userId,
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
  
  const idMap = new Map<string, string>()
  
  function getOrCreateUuid(id: string): string {
    if (!idMap.has(id)) {
      idMap.set(id, ensureUuid(id))
    }
    return idMap.get(id)!
  }
  
  const lessonsToUpsert: any[] = [];
  
  for (const child of children) {
    console.log('Processing child:', child.name);
    const childId = getOrCreateUuid(child.id)
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
      const ygId = getOrCreateUuid(yg.id)
      const { error: ygError } = await supabase
        .from('year_groups')
        .upsert({
          id: ygId,
          child_id: childId,
          user_id: userId,
          name: yg.name,
          order_index: parseInt(yg.name.replace(/[^0-9]/g, '')) || 0
        })
      
      if (ygError) {
        console.error('Error saving year group:', yg.name, ygError);
        throw ygError;
      }

      for (const subject of yg.subjects) {
        const subId = getOrCreateUuid(subject.id)
        const { error: subError } = await supabase
          .from('subjects')
          .upsert({
            id: subId,
            year_group_id: ygId,
            user_id: userId,
            name: subject.name,
            category: subject.category,
            color: subject.color,
            order_index: 0
          })
        
        if (subError) {
          console.error('Error saving subject:', subject.name, subError);
          throw subError;
        }

        for (const topic of subject.topics) {
          const topicId = getOrCreateUuid(topic.id)
          const { error: topicError } = await supabase
            .from('topics')
            .upsert({
              id: topicId,
              subject_id: subId,
              user_id: userId,
              name: topic.name,
              order_index: 0
            })
          
          if (topicError) {
            console.error('Error saving topic:', topic.name, topicError);
            throw topicError;
          }
          
          for (const lesson of topic.lessons) {
            const lessonId = getOrCreateUuid(lesson.id)
            lessonsToUpsert.push({
              id: lessonId,
              topic_id: topicId,
              user_id: userId,
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
          }
        }
      }
    }
  }
  
  if (lessonsToUpsert.length > 0) {
    console.log('saveFullCurriculum: batching upsert of', lessonsToUpsert.length, 'lessons');
    const { error: lessonError } = await supabase
      .from('lessons')
      .upsert(lessonsToUpsert);
    
    if (lessonError) {
      console.error('Error batch upserting lessons:', lessonError);
      throw lessonError;
    }
  }
  
  console.log('saveFullCurriculum: complete');
}

// Fetch functions
export const fetchChildren = async (userId: string): Promise<ChildProfile[]> => {
  console.log('fetchChildren: loading for userId', userId);
  
  // Use nested select to fetch all data in one query
  const { data: children, error } = await supabase
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
    .order('order_index')

  if (error) {
    console.error('fetchChildren error:', error);
    throw error;
  }
  
  console.log('fetchChildren: found', children?.length || 0, 'children for userId', userId);
  if (!children || children.length === 0) return []

  // Transform nested data to ChildProfile format
  const childrenWithData: ChildProfile[] = children.map((child: any) => ({
    id: child.id,
    name: child.name,
    dob: child.dob || '',
    avatar: child.avatar,
    themeColor: child.theme_color,
    yearGroups: (child.year_groups || []).map((yg: any) => ({
      id: yg.id,
      name: yg.name,
      subjects: (yg.subjects || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        category: sub.category,
        color: sub.color,
        topics: (sub.topics || []).map((topic: any) => ({
          id: topic.id,
          name: topic.name,
          lessons: (topic.lessons || []).map((l: any) => ({
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
        }))
      }))
    }))
  }));

  console.log('fetchChildren: returning', childrenWithData.length, 'children with full data');
  return childrenWithData
}

// Manual upload
export const uploadToSupabase = async (userId: string, currentData?: ChildProfile[]): Promise<{ success: boolean; message: string }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase not configured' };
  }

  try {
    // Try localStorage first, fallback to current React state
    const localData = getLocalData();
    const dataToUpload = localData.length > 0 ? localData : (currentData || []);
    
    console.log('uploadToSupabase: localData:', localData.length, 'children, currentData:', currentData?.length || 0, 'children');
    
    if (!dataToUpload || dataToUpload.length === 0) {
      return { success: false, message: 'No data found. Import curriculum first via Build Curriculum.' };
    }

    console.log('Manual upload: Starting upload to Supabase for user:', userId, '- children:', dataToUpload.length);

    // Pre-generate all UUIDs for consistency
    const idMap = new Map<string, string>()
    
    function getOrCreateUuid(id: string): string {
      if (!idMap.has(id)) {
        idMap.set(id, ensureUuid(id))
      }
      return idMap.get(id)!
    }

    for (const child of dataToUpload) {
      const childId = getOrCreateUuid(child.id);
      
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
        const ygId = getOrCreateUuid(yg.id);
        const { error: ygError } = await supabase
          .from('year_groups')
          .upsert({
            id: ygId,
            child_id: childId,
            user_id: userId,
            name: yg.name,
            order_index: parseInt(yg.name.replace(/[^0-9]/g, '')) || 0
          });

        if (ygError) {
          console.error('Error uploading year group:', ygError);
          continue;
        }

        for (const sub of yg.subjects) {
          const subId = getOrCreateUuid(sub.id);
          const { error: subError } = await supabase
            .from('subjects')
            .upsert({
              id: subId,
              year_group_id: ygId,
              user_id: userId,
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
            const topicId = getOrCreateUuid(topic.id);
            const { error: topicError } = await supabase
              .from('topics')
              .upsert({
                id: topicId,
                subject_id: subId,
                user_id: userId,
                name: topic.name,
                order_index: 0
              });

            if (topicError) {
              console.error('Error uploading topic:', topicError);
              continue;
            }

            for (const lesson of topic.lessons) {
              const lesId = getOrCreateUuid(lesson.id);
              const { error: lesError } = await supabase
                .from('lessons')
                .upsert({
                  id: lesId,
                  topic_id: topicId,
                  user_id: userId,
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
    console.log('Uploaded children IDs:', dataToUpload.map(c => c.id));
    return { success: true, message: `Uploaded ${dataToUpload.length} children to Supabase` };
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
  
  // Fetch all related data in parallel
  const [yearGroupsResult, subjectsResult, topicsResult, lessonsResult] = await Promise.all([
    supabase.from('year_groups').select('*').in('child_id', childIds).order('order_index'),
    supabase.from('subjects').select('*').order('order_index'),
    supabase.from('topics').select('*').order('order_index'),
    supabase.from('lessons').select('*').order('order_index')
  ]);

  if (yearGroupsResult.error || subjectsResult.error || topicsResult.error || lessonsResult.error) return [];
  
  const yearGroups = yearGroupsResult.data || [];
  const subjects = subjectsResult.data || [];
  const topics = topicsResult.data || [];
  const lessons = lessonsResult.data || [];

  // Build lookup maps for O(1) access
  const subjectsByYgId = new Map<string, any[]>();
  const topicsBySubId = new Map<string, any[]>();
  const lessonsByTopicId = new Map<string, any[]>();

  for (const sub of subjects) {
    const ygId = sub.year_group_id;
    if (!subjectsByYgId.has(ygId)) subjectsByYgId.set(ygId, []);
    subjectsByYgId.get(ygId)!.push(sub);
  }

  for (const topic of topics) {
    const subId = topic.subject_id;
    if (!topicsBySubId.has(subId)) topicsBySubId.set(subId, []);
    topicsBySubId.get(subId)!.push(topic);
  }

  for (const lesson of lessons) {
    const topicId = lesson.topic_id;
    if (!lessonsByTopicId.has(topicId)) lessonsByTopicId.set(topicId, []);
    lessonsByTopicId.get(topicId)!.push(lesson);
  }

  // Build hierarchy using lookup maps
  const childrenWithData: ChildProfile[] = children.map((child: any) => {
    const childYearGroups = yearGroups.filter((yg: any) => yg.child_id === child.id);
    const yearGroupsWithSubjects = childYearGroups.map((yg: any) => {
      const ygSubjects = subjectsByYgId.get(yg.id) || [];
      const subjectsWithTopics = ygSubjects.map((s: any) => {
        const sTopics = topicsBySubId.get(s.id) || [];
        const topicsWithLessons = sTopics.map((t: any) => ({
          id: t.id,
          name: t.name,
          lessons: (lessonsByTopicId.get(t.id) || []).map((l: any) => ({
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
