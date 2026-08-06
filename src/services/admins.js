// src/services/admins.js
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase.js'
import { mapDoc } from './firestoreUtils.js'

export function useAdmins(ownerId) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setAdmins([])
      setLoading(false)
      return
    }
    const q = query(collection(db, 'admins'), where('ownerId', '==', ownerId))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setAdmins(snapshot.docs.map(mapDoc))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [ownerId])

  return { admins, loading }
}

export async function addStaff({ name, email, password, role }) {
  const callable = httpsCallable(functions, 'createStaffAccount')
  return callable({ name, email, password, role })
}
