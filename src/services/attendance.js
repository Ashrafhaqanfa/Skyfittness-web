// src/services/attendance.js

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return {
    ...raw,
    date: toDate(raw.date),
    checkInTime: toDate(raw.checkInTime),
  }
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
      collection(db, "attendance"),
      where("ownerId", "==", ownerId),
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<", Timestamp.fromDate(endOfDay)),
      orderBy("date", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTodaysAttendance(
          snapshot.docs.map((doc) => normalize(mapDoc(doc)))
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
    todaysAttendance,
    loading,
  }
}

export function hasCheckedInToday(todaysAttendance, memberId) {
  return todaysAttendance.some((a) => a.memberId === memberId)
}

export async function checkIn(memberId, todaysAttendance, ownerId) {
  if (!ownerId) {
    throw new Error("Owner not authenticated.")
  }

  if (hasCheckedInToday(todaysAttendance, memberId)) {
    return
  }

  // Verify member ownership
  const memberRef = doc(db, "members", memberId)
  const memberSnap = await getDoc(memberRef)

  if (!memberSnap.exists()) {
    throw new Error("Member not found.")
  }

  const member = memberSnap.data()

  if (member.ownerId !== ownerId) {
    throw new Error("Unauthorized check-in.")
  }

  const now = new Date()

  return addDoc(collection(db, "attendance"), {
    ownerId,
    memberId,
    date: now,
    checkInTime: now,
    createdAt: now,
  })
}

export async function undoCheckIn(todaysAttendance, memberId, ownerId) {
  const record = todaysAttendance.find(
    (a) => a.memberId === memberId
  )

  if (!record) {
    return
  }

  const attendanceRef = doc(db, "attendance", record.id)
  const attendanceSnap = await getDoc(attendanceRef)

  if (!attendanceSnap.exists()) {
    return
  }

  if (attendanceSnap.data().ownerId !== ownerId) {
    throw new Error("Unauthorized.")
  }

  await deleteDoc(attendanceRef)
}

export async function fetchHistory(memberId, ownerId) {
  const memberRef = doc(db, "members", memberId)
  const memberSnap = await getDoc(memberRef)

  if (!memberSnap.exists()) {
    throw new Error("Member not found.")
  }

  if (memberSnap.data().ownerId !== ownerId) {
    throw new Error("Unauthorized.")
  }

  const q = query(
    collection(db, "attendance"),
    where("ownerId", "==", ownerId),
    where("memberId", "==", memberId),
    orderBy("date", "desc"),
    limit(30)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) =>
    normalize(mapDoc(doc))
  )
}
