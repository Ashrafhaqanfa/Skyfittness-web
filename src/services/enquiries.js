// src/services/enquiries.js
//
// Ports Services/EnquiryService.swift. Firestore collection: "enquiries"

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return {
    ...raw,
    followUpDate: toDate(raw.followUpDate),
    createdAt: toDate(raw.createdAt) || new Date(),
    status: raw.status || 'new',
  }
}

export function useEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEnquiries(snapshot.docs.map((d) => normalize(mapDoc(d))))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [])

  return { enquiries, loading }
}

export async function addEnquiry(enquiry) {
  return addDoc(collection(db, 'enquiries'), { ...enquiry, createdAt: new Date() })
}

export async function updateEnquiry(id, enquiry) {
  return setDoc(doc(db, 'enquiries', id), enquiry, { merge: true })
}

export async function deleteEnquiry(id) {
  return deleteDoc(doc(db, 'enquiries', id))
}

export function todaysFollowUps(enquiries) {
  const today = new Date()
  return enquiries.filter((e) => {
    if (!e.followUpDate) return false
    const sameDay =
      e.followUpDate.getFullYear() === today.getFullYear() &&
      e.followUpDate.getMonth() === today.getMonth() &&
      e.followUpDate.getDate() === today.getDate()
    return sameDay && e.status !== 'converted' && e.status !== 'lost'
  })
}

export function enquiriesWithStatus(enquiries, status) {
  return enquiries.filter((e) => e.status === status)
}
