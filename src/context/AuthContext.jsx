// src/context/AuthContext.jsx
//
// Simplified: no staff/trainer accounts, no Cloud Function needed. Every
// signed-in user's data is scoped by their own uid — matches the simpler
// Firestore rules (ownerId == request.auth.uid, everywhere).

import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'admins', user.uid))
          setCurrentAdmin(snap.exists() ? { id: snap.id, ...snap.data() } : null)
        } catch {
          setCurrentAdmin(null)
        }
      } else {
        setCurrentAdmin(null)
      }
      setAuthReady(true)
    })
    return unsubscribe
  }, [])

  async function signIn(email, password) {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setErrorMessage(friendlyAuthError(error))
    }
    setIsLoading(false)
  }

  async function signUp(name, email, password) {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // Just profile info now — not used to compute data ownership anymore.
      await setDoc(doc(db, 'admins', result.user.uid), {
        name,
        role: 'owner',
        loginEmail: email,
      })
    } catch (error) {
      setErrorMessage(friendlyAuthError(error))
    }
    setIsLoading(false)
  }

  function signOut() {
    firebaseSignOut(auth)
  }

  // Every account's data is scoped to their own uid — simple, no staff
  // indirection. Matches: `request.resource.data.ownerId == request.auth.uid`
  // in your Firestore rules exactly.
  const ownerId = currentUser?.uid || null

  const value = {
    currentUser,
    currentAdmin,
    ownerId,
    authReady,
    isLoading,
    errorMessage,
    setErrorMessage,
    isLoggedIn: !!currentUser,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

function friendlyAuthError(error) {
  const code = error?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Incorrect email or password, or this account does not exist yet.'
  }
  if (code.includes('email-already-in-use')) {
    return 'An account with this email already exists — try signing in instead.'
  }
  if (code.includes('weak-password')) {
    return 'Password should be at least 6 characters.'
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.'
  }
  return error?.message || 'Something went wrong. Please try again.'
}
