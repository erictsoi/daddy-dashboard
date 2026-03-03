import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where
} from 'firebase/firestore'
import { db } from './firebase'
import {
  ChildProfile, YearGroup, Subject, Topic, Lesson,
  UserSettings, DEFAULT_SETTINGS, ProfileTemplateData
} from '../types'
import { generateUuid } from './helpers'
import { logger } from './logger'
import { createEmptyStacks } from '../constants'

// --- Constants ---
const STORAGE_KEY = 'daddy_dashboard_data'

// Firestore path constants
const PATHS = {
  USERS: 'users',
  CHILDREN: 'children',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  LINKED_ACCOUNTS: 'linkedAccounts'
} as const;

// --- Data Mappers ---

export const mapFrequencyToType = (freq: any): 'low' | 'balanced' | 'high' => {
  if (freq === 1 || freq === 'low') return 'low';
  if (freq === 3 || freq === 'high') return 'high';
  return 'balanced';
};

export const toLesson = (data: any): Lesson => ({
  id: data.id || data.lessonId || generateUuid(),
  title: data.title || data.lessonTitle || 'Untitled Lesson',
  durationMinutes: data.durationMinutes || data.duration_minutes || 45,
  completed: !!data.completed,
  videoUrl: data.videoUrl || data.video_url || '',
  outcomes: Array.isArray(data.outcomes) ? data.outcomes : [],
  lessonFocus: data.lessonFocus || data.lesson_focus || '',
  lessonNotes: data.lessonNotes || data.lesson_notes || '',
  deleted: !!data.deleted,
  timeSpentSeconds: data.timeSpentSeconds || data.time_spent_seconds || 0,
  videoPosition: data.videoPosition || data.video_position || 0,
  orderIndex: data.orderIndex || data.order_index || 0
});

export const toTopic = (data: any): Topic => ({
  id: data.id || generateUuid(),
  name: data.name || 'Untitled Topic',
  lessons: Array.isArray(data.lessons) ? data.lessons.map(toLesson) : [],
  youtubeUrls: Array.isArray(data.youtubeUrls) ? data.youtubeUrls : [],
  focus: data.focus || '',
  notes: data.notes || '',
  timeSpentSeconds: data.timeSpentSeconds || 0,
  frequency: mapFrequencyToType(data.frequency)
});

export const toSubject = (data: any): Subject => ({
  id: data.id || generateUuid(),
  name: data.name || 'Untitled Subject',
  topics: Array.isArray(data.topics) ? data.topics.map(toTopic) : [],
  category: data.category || 'General',
  color: data.color || 'bg-gray-100 text-gray-800'
});

export const toYearGroup = (data: any): YearGroup => ({
  id: data.id || generateUuid(),
  name: data.name || 'Untitled Year Group',
  subjects: Array.isArray(data.subjects) ? data.subjects.map(toSubject) : []
});

export const toChildProfile = (data: any): ChildProfile => ({
  id: data.id || generateUuid(),
  name: data.name || 'Unnamed Child',
  dob: data.dob || '',
  avatar: data.avatar || '👶',
  themeColor: data.themeColor || data.theme_color || 'blue',
  googleEmail: data.googleEmail || data.google_email || undefined,
  yearGroups: Array.isArray(data.yearGroups) ? data.yearGroups.map(toYearGroup) : [],
  profileTemplate: data.profileTemplate,
  profileData: data.profileData ? toProfileTemplateData(data.profileData) : undefined
});

// Helper function to convert raw profile data to typed ProfileTemplateData
// Not exported - used internally by toChildProfile
const toProfileTemplateData = (data: any): ProfileTemplateData | undefined => {
  if (!data) return undefined;
  return {
    template: data.template,
    customName: data.customName,
    interests: data.interests,
    stacks: Array.isArray(data.stacks) ? data.stacks : createEmptyStacks(),
    approved: !!data.approved,
    createdAt: data.createdAt || new Date().toISOString()
  };
};

export const getLocalData = (): ChildProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  logger.log('[dataService] getLocalData: key=', STORAGE_KEY, 'has data=', !!stored)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return parsed
    } catch (e) {
      logger.error('[dataService] Failed to parse localStorage:', e)
      throw new Error("Failed to parse localStorage data. It may be corrupted.")
    }
  }
  return []
}

export const saveLocalData = (data: ChildProfile[]) => {
  logger.log('[dataService] saveLocalData: saving', data.length, 'children')
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const saveFullCurriculum = async (
  children: ChildProfile[],
  userId: string
): Promise<void> => {
  logger.log('[dataService] saveFullCurriculum: saving', children.length, 'children')

  try {
    for (const child of children) {
      const childId = child.id?.length > 10 ? child.id : generateUuid()
      const childRef = doc(db, 'users', userId, 'children', childId)

      const childData = {
        ...child,
        id: childId,
        userId,
        updatedAt: new Date().toISOString()
      }

      await setDoc(childRef, childData, { merge: true })

      // Create/update linked account if child has googleEmail
      if (child.googleEmail) {
        const linkRef = doc(db, 'linkedAccounts', child.googleEmail.toLowerCase())
        await setDoc(linkRef, {
          childEmail: child.googleEmail.toLowerCase(),
          parentUid: userId,
          childId: childId,
          childName: child.name,
          updatedAt: new Date().toISOString()
        }, { merge: true })
      }
    }
    logger.log('[dataService] saveFullCurriculum: complete')
  } catch (error) {
    logger.error('[dataService] saveFullCurriculum error:', error)
    throw new Error('Failed to save curriculum to cloud storage')
  }
}

export const fetchChildren = async (userId: string): Promise<ChildProfile[]> => {
  logger.log('[dataService] fetchChildren loading')

  const childrenRef = collection(db, 'users', userId, 'children')
  const snapshot = await getDocs(childrenRef)

  logger.log('[dataService] fetchChildren: found', snapshot.size, 'documents')

  if (snapshot.empty) return []

  const children = snapshot.docs.map(doc => {
    return toChildProfile({ ...doc.data(), id: doc.id })
  })

  return children
}

export const fetchChildById = async (parentUid: string, childId: string): Promise<ChildProfile | null> => {
  try {
    const childRef = doc(db, 'users', parentUid, 'children', childId)
    const childSnap = await getDoc(childRef)

    if (!childSnap.exists()) {
      logger.warn('[dataService] fetchChildById: child not found', childId)
      return null
    }

    return toChildProfile({ ...childSnap.data(), id: childSnap.id })
  } catch (error) {
    logger.error('[dataService] fetchChildById error:', error)
    return null
  }
}

export const fetchChildByEmail = async (email: string): Promise<{ child: ChildProfile[]; allChildren: ChildProfile[]; parentUid: string }> => {
  if (!email) return { child: [], allChildren: [], parentUid: '' }

  try {
    const linkRef = collection(db, 'linkedAccounts')
    const linkQuery = query(linkRef, where('childEmail', '==', email.toLowerCase()))
    const linkSnapshot = await getDocs(linkQuery)

    if (linkSnapshot.empty) {
      logger.log('[dataService] fetchChildByEmail: no linked account found')
      return { child: [], allChildren: [], parentUid: '' }
    }

    const linkData = linkSnapshot.docs[0].data()
    const parentUid = linkData.parentUid

    // Fetch ALL children from parent's collection (for profile switching)
    const childrenRef = collection(db, 'users', parentUid, 'children')
    const allChildrenSnapshot = await getDocs(childrenRef)

    const allChildren = allChildrenSnapshot.docs.map(doc => toChildProfile({
      ...doc.data(),
      id: doc.id
    }))

    // Filter to find the signed-in child
    const child = allChildren.filter(c => c.googleEmail?.toLowerCase() === email.toLowerCase())

    return { child, allChildren, parentUid }
  } catch (error) {
    logger.error('[dataService] fetchChildByEmail error:', error)
    return { child: [], allChildren: [], parentUid: '' }
  }
}

export const uploadToFirebase = async (
  userId: string,
  currentData?: ChildProfile[]
): Promise<{ success: boolean; message: string }> => {
  const dataToUpload = currentData || getLocalData()

  if (!dataToUpload.length) {
    return { success: false, message: 'No data found. Import curriculum first.' }
  }

  try {
    await saveFullCurriculum(dataToUpload, userId)
    return { success: true, message: `Uploaded ${dataToUpload.length} children to Firebase` }
  } catch (error) {
    logger.error('[dataService] uploadToFirebase error:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Upload failed' }
  }
}

export const loadFromFirebase = async (userId: string): Promise<{
  success: boolean
  message: string
  data?: ChildProfile[]
}> => {
  try {
    const children = await fetchChildren(userId)
    if (children.length === 0) {
      return { success: false, message: 'No data found in Firebase' }
    }
    return {
      success: true,
      message: `Loaded ${children.length} children from Firebase`,
      data: children
    }
  } catch (error) {
    logger.error('[dataService] loadFromFirebase error:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Load failed' }
  }
}

export const updateChildGoogleEmail = async (childId: string, email: string, userId: string): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId)
  await setDoc(childRef, { googleEmail: email }, { merge: true })
}

export const softDeleteLessonInFirebase = async (
  childId: string,
  lessonId: string,
  userId: string
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId)
  const childDoc = await getDoc(childRef)

  if (!childDoc.exists()) return

  // Fix: Deep clone using structuredClone to avoid head-scratching mutation bugs
  const updated = structuredClone(childDoc.data() as ChildProfile)

  for (const yg of updated.yearGroups || []) {
    for (const sub of yg.subjects || []) {
      for (const topic of sub.topics || []) {
        const lesson = topic.lessons?.find(l => l.id === lessonId)
        if (lesson) {
          lesson.deleted = true
          break
        }
      }
    }
  }

  await setDoc(childRef, updated, { merge: true })
}

export const hardDeleteLessonFromFirebase = async (
  childId: string,
  lessonId: string,
  userId: string
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId)
  const childDoc = await getDoc(childRef)

  if (!childDoc.exists()) return

  const updated = structuredClone(childDoc.data() as ChildProfile)

  for (const yg of updated.yearGroups || []) {
    for (const sub of yg.subjects || []) {
      for (const topic of sub.topics || []) {
        topic.lessons = topic.lessons?.filter(l => l.id !== lessonId) || []
      }
    }
  }

  await setDoc(childRef, updated, { merge: true })
}

export const hardDeleteSubjectFromFirebase = async (
  subjectId: string,
  childId: string,
  userId: string
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId)
  const childDoc = await getDoc(childRef)

  if (!childDoc.exists()) return

  const updated = structuredClone(childDoc.data() as ChildProfile)

  for (const yg of updated.yearGroups || []) {
    yg.subjects = yg.subjects?.filter(s => s.id !== subjectId) || []
  }

  await setDoc(childRef, updated, { merge: true })
}

export const hardDeleteTopicFromFirebase = async (
  topicId: string,
  childId: string,
  userId: string
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId)
  const childDoc = await getDoc(childRef)

  if (!childDoc.exists()) return

  const updated = structuredClone(childDoc.data() as ChildProfile)

  for (const yg of updated.yearGroups || []) {
    for (const subj of yg.subjects || []) {
      subj.topics = subj.topics?.filter(t => t.id !== topicId) || []
    }
  }

  await setDoc(childRef, updated, { merge: true })
}

export const fetchUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'profile')
    const snapshot = await getDoc(settingsRef)

    if (snapshot.exists()) {
      return {
        ...DEFAULT_SETTINGS,
        ...snapshot.data()
      }
    }

    return DEFAULT_SETTINGS
  } catch (error) {
    logger.error('[dataService] fetchUserSettings error:', error)
    return DEFAULT_SETTINGS
  }
}

export const saveUserSettings = async (userId: string, settings: Partial<UserSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'profile')
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    logger.error('[dataService] saveUserSettings error:', error)
    throw error
  }
}

// --- Profile Template Functions ---

export const setChildProfileTemplate = async (
  userId: string,
  childId: string,
  template: string,
  customName?: string,
  interests?: string[]
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId);
  await setDoc(childRef, {
    profileTemplate: template,
    profileData: {
      template,
      customName: customName || '',
      interests: interests || [],
      stacks: createEmptyStacks(),
      approved: false,
      createdAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  }, { merge: true });
  logger.log('[dataService] Set profile template:', template, 'for child:', childId);
};

export const updateChildProfileData = async (
  userId: string,
  childId: string,
  profileData: ProfileTemplateData
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId);
  await setDoc(childRef, {
    profileData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  logger.log('[dataService] Updated profileData for child:', childId);
};

export const approveChildProfile = async (
  userId: string,
  childId: string
): Promise<void> => {
  const childRef = doc(db, 'users', userId, 'children', childId);
  const childDoc = await getDoc(childRef);
  
  if (!childDoc.exists()) {
    throw new Error('Child not found');
  }
  
  const data = childDoc.data();
  const currentProfileData = data.profileData || {};
  
  await setDoc(childRef, {
    profileData: {
      ...currentProfileData,
      approved: true
    },
    updatedAt: new Date().toISOString()
  }, { merge: true });
  logger.log('[dataService] Approved profile for child:', childId);
};
