// src/services/categoryPlans.js
//
// Ports Services/CategoryPlanService.swift. Firestore collections:
// "categories", "plans"

import { useEffect, useState } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import { mapDoc } from './firestoreUtils.js'

export function useCategoriesAndPlans() {
  const [categories, setCategories] = useState([])
  const [plans, setPlans] = useState([])

  useEffect(() => {
    const catQ = query(collection(db, 'categories'), orderBy('name'))
    const planQ = query(collection(db, 'plans'), orderBy('name'))
    const unsubCat = onSnapshot(catQ, (s) => setCategories(s.docs.map(mapDoc)))
    const unsubPlan = onSnapshot(planQ, (s) => setPlans(s.docs.map(mapDoc)))
    return () => {
      unsubCat()
      unsubPlan()
    }
  }, [])

  return { categories, plans }
}

export function plansForCategory(plans, categoryId) {
  return plans.filter((p) => p.categoryId === categoryId)
}

export async function addCategory(name) {
  return addDoc(collection(db, 'categories'), { name })
}

export async function addPlan({ categoryId, name, durationDays, price }) {
  return addDoc(collection(db, 'plans'), { categoryId, name, durationDays, price })
}

/// Populates example categories/plans on a fresh Firebase project, same as the
/// "Load sample categories & plans" button in the iOS app's More screen.
export async function seedSampleDataIfNeeded(categories) {
  if (categories.length > 0) return
  const exercise = await addDoc(collection(db, 'categories'), { name: 'Exercise' })
  const weightLoss = await addDoc(collection(db, 'categories'), { name: 'Weight Loss' })
  const yoga = await addDoc(collection(db, 'categories'), { name: 'Yoga' })

  await Promise.all([
    addDoc(collection(db, 'plans'), { categoryId: exercise.id, name: '1-Month Standard', durationDays: 30, price: 1500 }),
    addDoc(collection(db, 'plans'), { categoryId: exercise.id, name: '3-Month Gold', durationDays: 90, price: 4000 }),
    addDoc(collection(db, 'plans'), { categoryId: exercise.id, name: '12-Month Elite', durationDays: 365, price: 14000 }),
    addDoc(collection(db, 'plans'), { categoryId: weightLoss.id, name: '6-Month Program', durationDays: 180, price: 8000 }),
    addDoc(collection(db, 'plans'), { categoryId: yoga.id, name: '1-Month Yoga', durationDays: 30, price: 1200 }),
  ])
}
