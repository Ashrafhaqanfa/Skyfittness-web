// src/services/payments.js
//
// Ports Services/PaymentService.swift. Firestore collection: "payments"
// Scoped to the current account's ownerId, same pattern as members.js.

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  doc,
  writeBatch,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalizePayment(raw) {
  return { ...raw, paymentDate: toDate(raw.paymentDate) || new Date() }
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
      collection(db, 'payments'),
      where('ownerId', '==', ownerId)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => normalizePayment(mapDoc(d)))
        list.sort((a, b) => b.paymentDate - a.paymentDate)
        setPayments(list)
        setLoading(false)
      },
      (err) => { console.error('payments query failed:', err); setLoading(false) }
    )
    return unsubscribe
  }, [ownerId])

  return { payments, loading }
}

export async function recordPayment({ memberId, amount, mode, collectedBy, currentDueAmount, ownerId }) {
  const batch = writeBatch(db)

  const paymentRef = doc(collection(db, 'payments'))
  const paymentDate = new Date()
  batch.set(paymentRef, {
    memberId,
    amount,
    mode,
    collectedBy: collectedBy || null,
    paymentDate,
    ownerId,
  })

  const memberRef = doc(db, 'members', memberId)
  const newDue = Math.max(0, currentDueAmount - amount)
  batch.update(memberRef, { dueAmount: newDue, updatedAt: new Date() })

  await batch.commit()

  return { id: paymentRef.id, memberId, amount, mode, collectedBy: collectedBy || null, paymentDate }
}

export function todaysCollection(payments) {
  const today = new Date()
  return payments
    .filter((p) => isSameDay(p.paymentDate, today))
    .reduce((sum, p) => sum + p.amount, 0)
}

export function totalCollection(payments, month, year) {
  if (month == null || year == null) {
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }
  return payments
    .filter((p) => p.paymentDate.getMonth() + 1 === month && p.paymentDate.getFullYear() === year)
    .reduce((sum, p) => sum + p.amount, 0)
}

export function paymentsOnDate(payments, date) {
  return payments
    .filter((p) => isSameDay(p.paymentDate, date))
    .sort((a, b) => b.paymentDate - a.paymentDate)
}

export function totalCollectionOnDate(payments, date) {
  return paymentsOnDate(payments, date).reduce((sum, p) => sum + p.amount, 0)
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
