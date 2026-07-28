// src/services/admins.js
//
// Ports Services/AdminService.swift — lists staff/admins, and creates new
// staff accounts via the same `createStaffAccount` Cloud Function the iOS
// app uses (server-side, via Admin SDK, so it doesn't sign the calling
// owner out — see /functions/index.js). No new Cloud Function needed.

import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase.js'
import { mapDoc } from './firestoreUtils.js'

export function useAdmins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        setAdmins(snapshot.docs.map(mapDoc))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [])

  return { admins, loading }
}

export async function addStaff({ name, email, password, role }) {
  const callable = httpsCallable(functions, 'createStaffAccount')
  return callable({ name, email, password, role })
}
