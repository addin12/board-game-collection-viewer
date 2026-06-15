import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

/**
 * Returns a Firestore instance when Firebase env config is present, otherwise
 * null. When null, the sessions layer falls back to an in-memory store so the
 * app still runs (and is testable) without any cloud setup.
 *
 * The Firebase web config is NOT secret — these values ship to the client by
 * design; access is governed by Firestore security rules.
 */
let cached: Firestore | null | undefined

export function getDb(): Firestore | null {
  if (cached !== undefined) return cached

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!apiKey || !projectId) {
    cached = null
    return cached
  }

  const config: FirebaseOptions = {
    apiKey,
    projectId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  }

  const app = getApps().length ? getApp() : initializeApp(config)
  cached = getFirestore(app)
  return cached
}
