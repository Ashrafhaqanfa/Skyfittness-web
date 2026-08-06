// src/context/AuthContext.jsx
//
// Ports Services/AuthService.swift, PLUS adds multi-tenant data isolation:
// every admin now has an "ownerId" — for an owner account, that's their own
// uid; for staff/trainer accounts, it's whichever owner created them. Every
// other service (members, payments, etc.) filters and stamps records using
// this value, so accounts never see each other's data.

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

  async function signUp(name, email, password, role = 'owner') {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'admins', result.user.uid), {
        name,
        role,
        loginEmail: email,
        ownerId: result.user.uid,
      })
    } catch (error) {
      setErrorMessage(friendlyAuthError(error))
    }
    setIsLoading(false)
  }

  function signOut() {
    firebaseSignOut(auth)
  }

  // The id that scopes ALL of this account's data. For an owner, it's their
  // own uid. For staff/trainer, it's the ownerId their admin doc was stamped
  // with when the owner created their account (see services/admins.js).
  const ownerId = currentAdmin
    ? (currentAdmin.role === 'owner' ? currentUser?.uid : currentAdmin.ownerId)
    : null

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
