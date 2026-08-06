// src/services/dietPlans.js

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return {
    ...raw,
    createdAt: toDate(raw.createdAt) || new Date(),
    updatedAt: toDate(raw.updatedAt),
  }
}

export function useDietPlans() {
  const { ownerId } = useAuth()

  const [dietPlans, setDietPlans] = useState([])

  useEffect(() => {
    if (!ownerId) {
      setDietPlans([])
      return
    }

    const q = query(
      collection(db, 'dietPlans'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setDietPlans(
          snapshot.docs.map((doc) => normalize(mapDoc(doc)))
        )
      },
      (err) => console.error(err)
    )

    return unsubscribe
  }, [ownerId])

  return { dietPlans }
}

export async function addDietPlan(plan, ownerId) {
  return addDoc(collection(db, 'dietPlans'), {
    ...plan,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function deleteDietPlan(id, ownerId) {
  const ref = doc(db, 'dietPlans', id)

  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return
  }

  if (snap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized')
  }

  return deleteDoc(ref)
}

export function dietPlansForMember(dietPlans, memberId) {
  return dietPlans.filter(
    (plan) => plan.memberId === memberId
  )
}
