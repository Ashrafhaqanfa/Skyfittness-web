// src/services/payments.js
//
// Payment Service
// Firestore Collection: payments
// Multi-tenant version (ownerId isolated)

import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalizePayment(raw) {
  return {
    ...raw,
    paymentDate: toDate(raw.paymentDate) || new Date(),
  }
}

export function usePayments() {
  const { ownerId } = useAuth()

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setPayments([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "payments"),
      where("ownerId", "==", ownerId),
      orderBy("paymentDate", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPayments(
          snapshot.docs.map((doc) => normalizePayment(mapDoc(doc)))
        )
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [ownerId])

  return {
    payments,
    loading,
  }
}

export async function recordPayment({
  memberId,
  amount,
  mode,
  collectedBy,
  currentDueAmount,
  ownerId,
}) {
  // Verify the member belongs to this owner
  const memberRef = doc(db, "members", memberId)
  const memberSnap = await getDoc(memberRef)

  if (!memberSnap.exists()) {
    throw new Error("Member not found.")
  }

  const member = memberSnap.data()

  if (member.ownerId !== ownerId) {
    throw new Error("Unauthorized payment attempt.")
  }

  const batch = writeBatch(db)

  const paymentRef = doc(collection(db, "payments"))

  const paymentDate = new Date()

  batch.set(paymentRef, {
    ownerId,
    memberId,
    amount: Number(amount),
    mode,
    collectedBy: collectedBy || null,
    paymentDate,
    createdAt: new Date(),
  })

  const newDue = Math.max(
    0,
    Number(currentDueAmount) - Number(amount)
  )

  batch.update(memberRef, {
    dueAmount: newDue,
    updatedAt: new Date(),
  })

  await batch.commit()

  return {
    id: paymentRef.id,
    ownerId,
    memberId,
    amount,
    mode,
    collectedBy,
    paymentDate,
  }
}

export function todaysCollection(payments) {
  const today = new Date()

  return payments
    .filter((p) => isSameDay(p.paymentDate, today))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
}

export function totalCollection(payments, month, year) {
  if (month == null || year == null) {
    return payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    )
  }

  return payments
    .filter(
      (p) =>
        p.paymentDate.getMonth() + 1 === month &&
        p.paymentDate.getFullYear() === year
    )
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
}

export function paymentsOnDate(payments, date) {
  return payments
    .filter((p) => isSameDay(p.paymentDate, date))
    .sort((a, b) => b.paymentDate - a.paymentDate)
}

export function totalCollectionOnDate(payments, date) {
  return paymentsOnDate(payments, date)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
