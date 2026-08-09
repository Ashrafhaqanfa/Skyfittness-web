// src/services/dietPlans.js
import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
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
      where('ownerId', '==', ownerId)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => normalize(mapDoc(d)))
      list.sort((a, b) => b.createdAt - a.createdAt)
      setDietPlans(list)
    }, (err) => console.error('dietPlans query failed:', err))
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
