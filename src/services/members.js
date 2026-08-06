// src/services/members.js
//
// Ports Models/Member.swift + Services/MemberService.swift.
// Firestore collection: "members"
// Every query is scoped to the signed-in account's ownerId, and every write
// stamps it — so members created under one gym owner never show up for a
// different owner.

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalizeMember(raw) {
  return {
    ...raw,
    dateOfBirth: toDate(raw.dateOfBirth),
    joinDate: toDate(raw.joinDate),
    expiryDate: toDate(raw.expiryDate),
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
    marriageAnniversary: toDate(raw.marriageAnniversary),
    dueAmountReminderDate: toDate(raw.dueAmountReminderDate),
  }
}

export function daysUntilExpiry(member) {
  if (!member.expiryDate) return 0
  const ms = member.expiryDate.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(ms / 86400000)
}

export function isExpired(member) {
  return daysUntilExpiry(member) < 0
}

export function expiryBucket(member) {
  if (isExpired(member)) return 'expired'
  const d = daysUntilExpiry(member)
  if (d >= 0 && d <= 3) return 'expiring1to3'
  if (d >= 4 && d <= 7) return 'expiring4to7'
  if (d >= 8 && d <= 15) return 'expiring8to15'
  return 'notExpiringSoon'
}

export function isBirthdayToday(member) {
  if (!member.dateOfBirth) return false
  const today = new Date()
  return (
    member.dateOfBirth.getMonth() === today.getMonth() &&
    member.dateOfBirth.getDate() === today.getDate()
  )
}

export function isAnniversaryToday(member) {
  if (!member.joinDate) return false
  const today = new Date()
  return (
    member.joinDate.getMonth() === today.getMonth() &&
    member.joinDate.getDate() === today.getDate()
  )
}

export function useMembers() {
  const { ownerId } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setMembers([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'members'),
      where('ownerId', '==', ownerId),
      orderBy('expiryDate')
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMembers(snapshot.docs.map((d) => normalizeMember(mapDoc(d))))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [ownerId])

  return { members, loading }
}

export function liveMembers(members) {
  return members.filter((m) => m.status === 'live' && !isExpired(m))
}
export function expiredMembers(members) {
  return members.filter(isExpired)
}
export function demoMembers(members) {
  return members.filter((m) => m.status === 'demo')
}
export function membersInBucket(members, bucket) {
  return members.filter((m) => expiryBucket(m) === bucket)
}
export function todaysBirthdays(members) {
  return members.filter(isBirthdayToday)
}
export function todaysAnniversaries(members) {
  return members.filter(isAnniversaryToday)
}
// Maps the actual gap between joinDate and expiryDate to one of the 4
// standard plan labels used on receipts — works automatically whether the
// duration was set via the Plan Duration quick-buttons or by hand-picking
// dates, since it doesn't depend on any separately stored "duration" field.
export function derivePlanLabel(member) {
  if (!member.joinDate || !member.expiryDate) return 'Custom'
  const days = Math.round((member.expiryDate - member.joinDate) / 86400000)
  if (days <= 35) return 'Monthly'
  if (days <= 100) return 'Three Months'
  if (days <= 200) return 'Six Months'
  return 'Yearly'
}
export function totalDueAmount(members) {
  return members.reduce((sum, m) => sum + (m.dueAmount || 0), 0)
}

// CRUD — each takes ownerId as an explicit argument.
// In a page component: const { ownerId } = useAuth(), then pass it through.

export async function addMember(member, ownerId) {
  const payload = { ...member, ownerId, createdAt: new Date(), updatedAt: new Date() }
  delete payload.id
  return addDoc(collection(db, 'members'), payload)
}

export async function updateMember(id, member, ownerId) {
  const payload = { ...member, ownerId, updatedAt: new Date() }
  delete payload.id
  return updateDoc(doc(db, 'members', id), payload)
}

export async function deleteMember(id) {
  return deleteDoc(doc(db, 'members', id))
}
