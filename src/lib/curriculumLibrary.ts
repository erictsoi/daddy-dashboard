import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc
} from 'firebase/firestore'
import { db } from './firebase'
import { CuratedPlaylist, DbCuratedPlaylist, ProfileTemplate } from '../types'
import { generateUuid } from './helpers'
import { logger } from './logger'

const COLLECTION_NAME = 'curriculumLibrary'

export const toCuratedPlaylist = (data: any): CuratedPlaylist => ({
  id: data.id || generateUuid(),
  yearGroup: data.yearGroup || data.year_group || 'Y1-2',
  subject: data.subject || '',
  topic: data.topic || '',
  focus: data.focus || '',
  primaryPlaylist: data.primaryPlaylist || data.primary_playlist || '',
  backupPlaylist1: data.backupPlaylist1 || data.backup_playlist_1,
  backupPlaylist2: data.backupPlaylist2 || data.backup_playlist_2,
  notes: data.notes || data.outcomes,
  outcomes: data.outcomes,
  verified: !!data.verified,
  addedBy: data.addedBy || data.added_by || 'admin',
  createdAt: data.createdAt || data.created_at || new Date().toISOString()
})

export const toDbCuratedPlaylist = (playlist: CuratedPlaylist): DbCuratedPlaylist => ({
  id: playlist.id,
  year_group: playlist.yearGroup,
  subject: playlist.subject,
  topic: playlist.topic,
  focus: playlist.focus,
  primary_playlist: playlist.primaryPlaylist,
  backup_playlist_1: playlist.backupPlaylist1,
  backup_playlist_2: playlist.backupPlaylist2,
  notes: playlist.notes,
  outcomes: playlist.outcomes,
  verified: playlist.verified,
  added_by: playlist.addedBy,
  created_at: playlist.createdAt
})

export const fetchCurriculumLibrary = async (): Promise<CuratedPlaylist[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    if (snapshot.empty) return []
    return snapshot.docs.map(doc => toCuratedPlaylist({ ...doc.data(), id: doc.id }))
  } catch (error) {
    logger.error('[curriculumLibrary] fetchCurriculumLibrary error:', error)
    return []
  }
}

export const fetchCurriculumByYear = async (
  yearGroup: ProfileTemplate
): Promise<CuratedPlaylist[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('yearGroup', '==', yearGroup)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return []
    return snapshot.docs.map(doc => toCuratedPlaylist({ ...doc.data(), id: doc.id }))
  } catch (error) {
    logger.error('[curriculumLibrary] fetchCurriculumByYear error:', error)
    return []
  }
}

export const fetchCurriculumBySubject = async (
  yearGroup: ProfileTemplate,
  subject: string
): Promise<CuratedPlaylist[]> => {
  try {
    const all = await fetchCurriculumByYear(yearGroup)
    return all.filter(p => p.subject.toLowerCase() === subject.toLowerCase())
  } catch (error) {
    logger.error('[curriculumLibrary] fetchCurriculumBySubject error:', error)
    return []
  }
}

export const saveCuratedPlaylist = async (
  playlist: CuratedPlaylist
): Promise<void> => {
  try {
    const id = playlist.id || generateUuid()
    const docRef = doc(db, COLLECTION_NAME, id)
    await setDoc(docRef, toDbCuratedPlaylist({ ...playlist, id }), { merge: true })
    logger.log('[curriculumLibrary] Saved playlist:', id)
  } catch (error) {
    logger.error('[curriculumLibrary] saveCuratedPlaylist error:', error)
    throw error
  }
}

export const deleteCuratedPlaylist = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
    logger.log('[curriculumLibrary] Deleted playlist:', id)
  } catch (error) {
    logger.error('[curriculumLibrary] deleteCuratedPlaylist error:', error)
    throw error
  }
}

export const verifyPlaylist = async (id: string, verified: boolean): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await setDoc(docRef, { verified }, { merge: true })
    logger.log('[curriculumLibrary] Playlist verified:', id, verified)
  } catch (error) {
    logger.error('[curriculumLibrary] verifyPlaylist error:', error)
    throw error
  }
}

// Age-appropriate topic filtering
const INAPPROPRIATE_TOPICS: Record<ProfileTemplate, string[]> = {
  'Y1-2': [
    'Algebra', 'Chemistry', 'Physics', 'Geometry', 'Fractions', 'Decimals',
    'Percentages', 'Statistics', 'Ancient Civilizations', 'World Wars',
    'Economics', 'Business', 'Media Studies', 'Latin', 'German'
  ],
  'Y3-4': [
    'Algebra', 'Chemistry', 'Physics', 'Geometry', 'Fractions', 'Decimals',
    'Percentages', 'Statistics', 'Ancient Civilizations', 'World Wars',
    'Economics', 'Business', 'Media Studies', 'Latin', 'German'
  ],
  'Y5-6': [
    'Algebra', 'Chemistry', 'Physics', 'Statistics',
    'Economics', 'Business', 'Media Studies', 'Latin'
  ],
  'Y7-8': [
    'Statistics'
  ],
  'Y9-10': [],
  'Y11-12': []
}

export const isTopicAppropriate = (
  yearGroup: ProfileTemplate,
  topic: string
): boolean => {
  const inappropriate = INAPPROPRIATE_TOPICS[yearGroup] || []
  return !inappropriate.some(t => 
    topic.toLowerCase().includes(t.toLowerCase()) ||
    t.toLowerCase().includes(topic.toLowerCase())
  )
}

export const filterAppropriatePlaylists = (
  playlists: CuratedPlaylist[],
  yearGroup: ProfileTemplate
): CuratedPlaylist[] => {
  return playlists.filter(p => isTopicAppropriate(yearGroup, p.topic))
}

// Get subjects appropriate for a year group
export const getSubjectsForYearGroup = (
  yearGroup: ProfileTemplate
): string[] => {
  const inappropriateTopics = INAPPROPRIATE_TOPICS[yearGroup] || []
  
  const ALL_SUBJECTS = [
    'English', 'Maths', 'Science', 'History', 'Geography',
    'Modern Language', 'Art & Design', 'Music', 'Drama',
    'Computing', 'Design & Technology', 'PE', 'PSHE', 'RE'
  ]
  
  return ALL_SUBJECTS
}
