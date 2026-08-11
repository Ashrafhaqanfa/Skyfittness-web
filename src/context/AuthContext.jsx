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
          const snap = await getDoc(doc(db,
