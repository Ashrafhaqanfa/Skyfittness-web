// src/services/categoryPlans.js

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
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

    const categoryQuery = query(
      collection(db, 'categories'),
      where('ownerId', '==', ownerId)
    )

    const planQuery = query(
      collection(db, 'plans'),
      where('ownerId', '==', ownerId)
    )

    const unsubscribeCategories = onSnapshot(
      categoryQuery,
      (snapshot) => {
        setCategories(snapshot.docs.map(mapDoc))
      },
      console.error
    )

    const unsubscribePlans = onSnapshot(
      planQuery,
      (snapshot) => {
        setPlans(snapshot.docs.map(mapDoc))
      },
      console.error
    )

    return () => {
      unsubscribeCategories()
      unsubscribePlans()
    }
  }, [ownerId])

  return {
    categories,
    plans,
  }
}

export function plansForCategory(plans, categoryId) {
  return plans.filter(
    (plan) => plan.categoryId === categoryId
  )
}

export async function addCategory(name, ownerId) {
  return addDoc(collection(db, 'categories'), {
    name,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function addPlan(
  {
    categoryId,
    name,
    durationDays,
    price,
  },
  ownerId
) {
  return addDoc(collection(db, 'plans'), {
    categoryId,
    name,
    durationDays: Number(durationDays),
    price: Number(price),
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function seedSampleDataIfNeeded(
  categories,
  ownerId
) {
  if (!ownerId) return

  if (categories.length > 0) return

  const exercise = await addCategory(
    'Exercise',
    ownerId
  )

  const weightLoss = await addCategory(
    'Weight Loss',
    ownerId
  )

  const yoga = await addCategory(
    'Yoga',
    ownerId
  )

  await Promise.all([
    addPlan(
      {
        categoryId: exercise.id,
        name: '1-Month Standard',
        durationDays: 30,
        price: 1500,
      },
      ownerId
    ),

    addPlan(
      {
        categoryId: exercise.id,
        name: '3-Month Gold',
        durationDays: 90,
        price: 4000,
      },
      ownerId
    ),

    addPlan(
      {
        categoryId: exercise.id,
        name: '12-Month Elite',
        durationDays: 365,
        price: 14000,
      },
      ownerId
    ),

    addPlan(
      {
        categoryId: weightLoss.id,
        name: '6-Month Program',
        durationDays: 180,
        price: 8000,
      },
      ownerId
    ),

    addPlan(
      {
        categoryId: yoga.id,
        name: '1-Month Yoga',
        durationDays: 30,
        price: 1200,
      },
      ownerId
    ),
  ])
}
