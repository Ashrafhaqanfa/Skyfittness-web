// src/services/attendance.js
import { useEffect, useState } from 'react'
import {
  collection, addDoc, deleteDoc, doc, getDocs, onSnapshot,
  query, where, orderBy, limit, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return { ...raw, date: toDate(raw.date), checkInTime: toDate(raw.checkInTime) }
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
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const q = query(
      collection(db, 'attendance'),
      where('ownerId', '==', ownerId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<', Timestamp.fromDate(endOfDay)),
      orderBy('date', 'desc')
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTodaysAttendance(snapshot.docs.map((d) => normalize(mapDoc(d))))
        setLoading(false)
      },
      () => setLoading(false)
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
  const q = query(
    collection(db, 'attendance'),
    where('ownerId', '==', ownerId),
    where('memberId', '==', memberId),
    orderBy('date', 'desc'),
    limit(30)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => normalize(mapDoc(d)))
}
