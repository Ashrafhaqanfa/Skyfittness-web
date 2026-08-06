// src/services/categoryPlans.js
import { useEffect, useState } from 'react'
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { mapDoc } from './firestoreUtils.js'

export function useCategoriesAndPlans() {
  const { ownerId } = useAuth()
  const [categories, setCategories] = useState([])
  const [plans, setPlans] = useState([])

  useEffect(() => {
    if (!ownerId) {
      setCategories([])
      setPlans([])
      return
    }
    const catQ = query(collection(db, 'categories'), where('ownerId', '==', ownerId))
    const planQ = query(collection(db, 'plans'), where('ownerId', '==', ownerId))
    const unsubCat = onSnapshot(catQ, (s) => setCategories(s.docs.map(mapDoc)))
    const unsubPlan = onSnapshot(planQ, (s) => setPlans(s.docs.map(mapDoc)))
    return () => {
      unsubCat()
      unsubPlan()
    }
  }, [ownerId])

  return { categories, plans }
}

export function plansForCategory(plans, categoryId) {
  return plans.filter((p) => p.categoryId === categoryId)
}

export async function addCategory(name, ownerId) {
  return addDoc(collection(db, 'categories'), { name, ownerId })
}

export async function addPlan({ categoryId, name, durationDays, price }, ownerId) {
  return addDoc(collection(db, 'plans'), { categoryId, name, durationDays, price, ownerId })
}

export async function seedSampleDataIfNeeded(categories, ownerId) {
  if (categories.length > 0) return
  const exercise = await addDoc(collection(db, 'categories'), { name: 'Exercise', ownerId })
  const weightLoss = await addDoc(collection(db, 'categories'), { name: 'Weight Loss', ownerId })
  const yoga = await addDoc(collection(db, 'categories'), { name: 'Yoga', ownerId })

  await Promise.all([
    addDoc(collection(db, 'plans'), { categoryId: exercise.id, name: '1-Month Standard', durationDays: 30, price: 1500, ownerId }),
    addDoc(collection(db, 'plans'), { categoryId: exercise.id, name: '3-Month Gold', durationDays: 90, price: 4000, ownerId }),
    addDoc(collection(db, 'plans'), { categoryId: exercise.id, name: '12-Month Elite', durationDays: 365, price: 14000, ownerId }),
    addDoc(collection(db, 'plans'), { categoryId: weightLoss.id, name: '6-Month Program', durationDays: 180, price: 8000, ownerId }),
    addDoc(collection(db, 'plans'), { categoryId: yoga.id, name: '1-Month Yoga', durationDays: 30, price: 1200, ownerId }),
  ])
}
