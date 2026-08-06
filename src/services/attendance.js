// src/services/attendance.js
//
// Ports Services/AttendanceService.swift. Firestore collection: "attendance"
// Filters ONLY by ownerId in Firestore (a single equality filter never needs
// a composite index) — the "today" date range and sorting happen in
// JavaScript instead, so this never silently fails on a missing index.

import { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return { ...raw, date: toDate(raw.date), checkInTime: toDate(raw.checkInTime) }
}

function isToday(date) {
  if (!date) return false
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function useTodaysAttendance() {
  const { ownerId } = useAuth()
  const [todaysAttendance, setTodaysAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setTodaysAttendance([])
      setLoading(false)
      return
    }
    const q = query(collection(db, 'attendance'), where('ownerId', '==', ownerId))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => normalize(mapDoc(d)))
          .filter((a) => isToday(a.date))
        list.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
        setTodaysAttendance(list)
        setLoading(false)
      },
      (err) => { console.error('attendance query failed:', err); setLoading(false) }
    )
    return unsubscribe
  }, [ownerId])

  return { todaysAttendance, loading }
}

export function hasCheckedInToday(todaysAttendance, memberId) {
  return todaysAttendance.some((a) => a.memberId === memberId)
}

export async function checkIn(memberId, todaysAttendance, ownerId) {
  if (hasCheckedInToday(todaysAttendance, memberId)) return
  const now = new Date()
  return addDoc(collection(db, 'attendance'), { memberId, date: now, checkInTime: now, ownerId })
}

export async function undoCheckIn(todaysAttendance, memberId) {
  const record = todaysAttendance.find((a) => a.memberId === memberId)
  if (!record) return
  return deleteDoc(doc(db, 'attendance', record.id))
}

export async function fetchHistory(memberId, ownerId) {
  const q = query(collection(db, 'attendance'), where('ownerId', '==', ownerId))
  const snapshot = await getDocs(q)
  const list = snapshot.docs
    .map((d) => normalize(mapDoc(d)))
    .filter((a) => a.memberId === memberId)
  list.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
  return list.slice(0, 30)
}
