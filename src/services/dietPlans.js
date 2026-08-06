// src/services/dietPlans.js
import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return { ...raw, createdAt: toDate(raw.createdAt) || new Date() }
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
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDietPlans(snapshot.docs.map((d) => normalize(mapDoc(d))))
    })
    return unsubscribe
  }, [ownerId])

  return { dietPlans }
}

export async function addDietPlan(plan, ownerId) {
  return addDoc(collection(db, 'dietPlans'), { ...plan, ownerId, createdAt: new Date() })
}

export async function deleteDietPlan(id) {
  return deleteDoc(doc(db, 'dietPlans', id))
}

export function dietPlansForMember(dietPlans, memberId) {
  return dietPlans.filter((p) => p.memberId === memberId)
}
