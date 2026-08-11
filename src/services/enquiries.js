// src/services/enquiries.js
import { useEffect, useState } from 'react'
import {
  collection, addDoc, setDoc, deleteDoc, doc, onSnapshot, query, where,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
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
  const { ownerId } = useAuth()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ownerId) {
      setEnquiries([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'enquiries'),
      where('ownerId', '==', ownerId)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => normalize(mapDoc(d)))
        list.sort((a, b) => b.createdAt - a.createdAt)
        setEnquiries(list)
        setLoading(false)
      },
      (err) => { console.error('enquiries query failed:', err); setLoading(false) }
    )
    return unsubscribe
  }, [ownerId])

  return { enquiries, loading }
}

export async function addEnquiry(enquiry, ownerId) {
  return addDoc(collection(db, 'enquiries'), { ...enquiry, ownerId, createdAt: new Date() })
}

export async function updateEnquiry(id, enquiry, ownerId) {
  return setDoc(doc(db, 'enquiries', id), { ...enquiry, ownerId }, { merge: true })
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
