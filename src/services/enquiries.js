// src/services/enquiries.js

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return {
    ...raw,
    followUpDate: toDate(raw.followUpDate),
    createdAt: toDate(raw.createdAt) || new Date(),
    updatedAt: toDate(raw.updatedAt),
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
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEnquiries(
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
    enquiries,
    loading,
  }
}

export async function addEnquiry(enquiry, ownerId) {
  return addDoc(collection(db, 'enquiries'), {
    ...enquiry,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function updateEnquiry(id, enquiry, ownerId) {
  const ref = doc(db, 'enquiries', id)

  const snap = await getDoc(ref)

  if (!snap.exists()) {
    throw new Error('Enquiry not found.')
  }

  if (snap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized.')
  }

  return setDoc(
    ref,
    {
      ...enquiry,
      ownerId,
      updatedAt: new Date(),
    },
    { merge: true }
  )
}

export async function deleteEnquiry(id, ownerId) {
  const ref = doc(db, 'enquiries', id)

  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return
  }

  if (snap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized.')
  }

  return deleteDoc(ref)
}

export function todaysFollowUps(enquiries) {
  const today = new Date()

  return enquiries.filter((e) => {
    if (!e.followUpDate) return false

    const sameDay =
      e.followUpDate.getFullYear() === today.getFullYear() &&
      e.followUpDate.getMonth() === today.getMonth() &&
      e.followUpDate.getDate() === today.getDate()

    return (
      sameDay &&
      e.status !== 'converted' &&
      e.status !== 'lost'
    )
  })
}

export function enquiriesWithStatus(enquiries, status) {
  return enquiries.filter((e) => e.status === status)
}
