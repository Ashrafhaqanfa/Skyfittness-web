// src/services/dietPlans.js
//
// Ports Services/DietPlanService.swift. Firestore collection: "dietPlans"
// NOTE: the original Swift service ordered by a field called "assignedDate"
// that doesn't actually exist on the DietPlan model (it has "createdAt")  —
// that looks like a pre-existing bug in the iOS app. This web version orders
// by the field that's actually there: "createdAt".

import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return { ...raw, createdAt: toDate(raw.createdAt) || new Date() }
}

export function useDietPlans() {
  const [dietPlans, setDietPlans] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'dietPlans'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDietPlans(snapshot.docs.map((d) => normalize(mapDoc(d))))
    })
    return unsubscribe
  }, [])

  return { dietPlans }
}

export async function addDietPlan(plan) {
  return addDoc(collection(db, 'dietPlans'), { ...plan, createdAt: new Date() })
}

export async function deleteDietPlan(id) {
  return deleteDoc(doc(db, 'dietPlans', id))
}

export function dietPlansForMember(dietPlans, memberId) {
  return dietPlans.filter((p) => p.memberId === memberId)
}
