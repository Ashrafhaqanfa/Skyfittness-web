// src/firebase.js
//
// Firebase initialization for the Gym Admin Portal web app.

import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyC9NE3w0QJEq2yJ5Jig1rk2HOc8K6CIoJU',
  authDomain: 'gymappweb-b803d.firebaseapp.com',
  projectId: 'gymappweb-b803d',
  storageBucket: 'gymappweb-b803d.firebasestorage.app',
  messagingSenderId: '256824861917',
  appId: '1:256824861917:web:b06694ea51ed922e222734',
  measurementId: 'G-YYE2M3556P',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// Analytics only works in a real browser (not during build/SSR), so this
// guards against errors — safe to ignore if you don't care about analytics.
export let analytics = null
isSupported().then((supported) => {
  if (supported) analytics = getAnalytics(app)
})
