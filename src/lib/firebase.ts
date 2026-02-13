import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore'
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut 
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAmw_heQa656b5U6HuofGlL_b2xvZCFnyY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "daddy-dashboard.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "daddy-dashboard",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "daddy-dashboard.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "533240281488",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:533240281488:web:8baf9450681390bcd29b15"
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence: Not supported in this browser')
    }
  })

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const logOut = () => firebaseSignOut(auth)
