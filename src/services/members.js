// src/services/members.js
//
// Ports Models/Member.swift + Services/MemberService.swift.
// Firestore collection: "members"

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
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

// MARK: - Derived status logic (matches Member.swift exactly)

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

// MARK: - Realtime hook (ports @Published var members + startListening/stopListening)

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('expiryDate'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMembers(snapshot.docs.map((d) => normalizeMember(mapDoc(d))))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [])

  return { members, loading }
}

// MARK: - Derived collections (ports MemberService.swift computed properties)

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
export function totalDueAmount(members) {
  return members.reduce((sum, m) => sum + (m.dueAmount || 0), 0)
}

// MARK: - CRUD

export async function addMember(member) {
  const payload = { ...member, createdAt: new Date(), updatedAt: new Date() }
  delete payload.id
  return addDoc(collection(db, 'members'), payload)
}

export async function updateMember(id, member) {
  const payload = { ...member, updatedAt: new Date() }
  delete payload.id
  return updateDoc(doc(db, 'members', id), payload)
}

export async function deleteMember(id) {
  return deleteDoc(doc(db, 'members', id))
}
