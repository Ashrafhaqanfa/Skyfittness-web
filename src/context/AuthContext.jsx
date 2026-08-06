// src/context/AuthContext.jsx

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
          const adminRef = doc(db, 'admins', user.uid)
          const adminSnap = await getDoc(adminRef)

          if (adminSnap.exists()) {
            setCurrentAdmin({
              id: adminSnap.id,
              ...adminSnap.data(),
            })
          } else {
            // Create admin document automatically for every new user
            const adminData = {
              name: user.displayName || '',
              loginEmail: user.email,
              ownerId: user.uid,
              createdAt: new Date(),
            }

            await setDoc(adminRef, adminData)

            setCurrentAdmin({
              id: user.uid,
              ...adminData,
            })
          }
        } catch (err) {
          console.error(err)
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
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      const adminData = {
        name,
        loginEmail: email,
        ownerId: result.user.uid,
        createdAt: new Date(),
      }

      await setDoc(
        doc(db, 'admins', result.user.uid),
        adminData
      )
    } catch (error) {
      setErrorMessage(friendlyAuthError(error))
    }

    setIsLoading(false)
  }

  function signOut() {
    firebaseSignOut(auth)
  }

  // Every user owns only their own data
  const ownerId = currentUser?.uid ?? null

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

function friendlyAuthError(error) {
  const code = error?.code || ''

  if (
    code.includes('invalid-credential') ||
    code.includes('wrong-password') ||
    code.includes('user-not-found')
  ) {
    return 'Incorrect email or password.'
  }

  if (code.includes('email-already-in-use')) {
    return 'This email is already registered.'
  }

  if (code.includes('weak-password')) {
    return 'Password should be at least 6 characters.'
  }

  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.'
  }

  return error?.message || 'Something went wrong.'
}
