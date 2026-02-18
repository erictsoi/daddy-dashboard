import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection,
  deleteDoc,
  query,
  where,
  orderBy,
  deleteField
} from 'firebase/firestore'
import { db } from './firebase'
import { ChildProfile, YearGroup, Subject, Topic, Lesson } from '../../types'

const STORAGE_KEY = 'daddy_dashboard_data'

function ensureUuid(id: string): string {
  if (!id || id.length < 10) {
    return `${id || 'id'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  return id
}

function formatDateForDb(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

export const getLocalData = (): ChildProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  console.log('getLocalData: key=', STORAGE_KEY, 'has data=', !!stored)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return parsed
    } catch (e) {
      console.error('Failed to parse localStorage:', e)
    }
  }
  return []
}

export const saveLocalData = (data: ChildProfile[]) => {
  console.log('saveLocalData: saving', data.length, 'children')
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const saveFullCurriculum = async (
  children: ChildProfile[], 
  userId: string
): Promise<void> => {
  console.log('saveFullCurriculum: saving', children.length, 'children for userId', userId)
  
  for (const child of children) {
    const childRef = doc(db, 'users', userId, 'children', ensureUuid(child.id))
    
    const childData = {
      ...child,
      id: ensureUuid(child.id),
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
        childId: child.id,
        childName: child.name,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    }
  }
  
  console.log('saveFullCurriculum: complete')
}

export const fetchChildren = async (userId: string): Promise<ChildProfile[]> => {
  console.log('fetchChildren: loading for userId', userId)
  
  const childrenRef = collection(db, 'users', userId, 'children')
  const snapshot = await getDocs(childrenRef)
  
  console.log('fetchChildren: found', snapshot.size, 'children')
  
  if (snapshot.empty) return []
  
  const children = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id
    } as ChildProfile
  })
  
  console.log('fetchChildren: returning', children.length, 'children with full data')
  return children
}

export const fetchChildById = async (parentUid: string, childId: string): Promise<ChildProfile | null> => {
  console.log('fetchChildById: loading child', childId, 'from parent', parentUid)
  
  try {
    const childRef = doc(db, 'users', parentUid, 'children', childId)
    const childSnap = await getDoc(childRef)
    
    if (!childSnap.exists()) {
      console.log('fetchChildById: child not found')
      return null
    }
    
    return {
      ...childSnap.data(),
      id: childSnap.id
    } as ChildProfile
  } catch (error) {
    console.error('fetchChildById error:', error)
    return null
  }
}

export const fetchChildByEmail = async (email: string): Promise<{ child: ChildProfile[]; allChildren: ChildProfile[]; parentUid: string }> => {
  console.log('fetchChildByEmail: looking for email', email)
  
  if (!email) return { child: [], allChildren: [], parentUid: '' }
  
  try {
    // First, look up which parent this child is linked to
    const linkRef = collection(db, 'linkedAccounts')
    const linkQuery = query(linkRef, where('childEmail', '==', email.toLowerCase()))
    const linkSnapshot = await getDocs(linkQuery)
    
    if (linkSnapshot.empty) {
      console.log('fetchChildByEmail: no linked account found')
      return { child: [], allChildren: [], parentUid: '' }
    }
    
    const linkData = linkSnapshot.docs[0].data()
    const parentUid = linkData.parentUid
    console.log('fetchChildByEmail: found parentUid', parentUid)
    
    // Fetch ALL children from parent's collection (for profile switching)
    const childrenRef = collection(db, 'users', parentUid, 'children')
    const allChildrenSnapshot = await getDocs(childrenRef)
    
    const allChildren = allChildrenSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ChildProfile[]
    
    // Filter to find the signed-in child
    const child = allChildren.filter(c => c.googleEmail?.toLowerCase() === email.toLowerCase())
    
    console.log('fetchChildByEmail: found', allChildren.length, 'children, matching child:', child.length)
    
    return { child, allChildren, parentUid }
  } catch (error) {
    console.error('fetchChildByEmail error:', error)
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
    console.error('Upload error:', error)
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
    console.error('Load error:', error)
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
  // With full document structure, need to find and update
  const childRef = doc(db, 'users', userId, 'children', childId)
  const childDoc = await getDoc(childRef)
  
  if (!childDoc.exists()) return
  
  const childData = childDoc.data() as ChildProfile
  const updated = { ...childData }
  
  // Find and update the lesson
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
  // Similar to soft delete but remove entirely
  const childRef = doc(db, 'users', userId, 'children', childId)
  const childDoc = await getDoc(childRef)
  
  if (!childDoc.exists()) return
  
  const childData = childDoc.data() as ChildProfile
  const updated = { ...childData }
  
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
  
  const childData = childDoc.data() as ChildProfile
  const updated = { ...childData }
  
  for (const yg of updated.yearGroups || []) {
    yg.subjects = yg.subjects?.filter(s => s.id !== subjectId) || []
  }
  
  await setDoc(childRef, updated, { merge: true })
}

export const migrateChildToTopicStructure = (child: ChildProfile): ChildProfile => {
  return {
    ...child,
    yearGroups: (child.yearGroups || []).map(yg => ({
      ...yg,
      subjects: (yg.subjects || []).map(sub => {
        if (Array.isArray((sub as any).topics) && (sub as any).topics.length > 0) {
          return sub
        }
        const existingLessons = Array.isArray((sub as any).lessons) ? (sub as any).lessons : []
        const topicName = sub.name && sub.name.includes(':') 
          ? sub.name.split(':')[1].trim() 
          : (sub.name || 'General')
        
        return {
          ...sub,
          topics: [{
            id: `${sub.id}-topic-${Date.now()}`,
            name: topicName,
            lessons: existingLessons
          }]
        }
      })
    }))
  }
}
