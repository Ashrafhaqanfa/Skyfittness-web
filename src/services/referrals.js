// src/services/referrals.js
import { useEffect, useState } from 'react'
import {
  collection, addDoc, updateDoc, doc, onSnapshot, query, where,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDate, mapDoc } from './firestoreUtils.js'

function normalize(raw) {
  return {
    ...raw,
    createdAt: toDate(raw.createdAt) || new Date(),
    rewardStatus: raw.rewardStatus || 'pending',
  }
}

export function useReferrals() {
  const { ownerId } = useAuth()
  const [referrals, setReferrals] = useState([])

  useEffect(() => {
    if (!ownerId) {
      setReferrals([])
      return
    }
    const q = query(
      collection(db, 'referrals'),
      where('ownerId', '==', ownerId)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => normalize(mapDoc(d)))
      list.sort((a, b) => b.createdAt - a.createdAt)
      setReferrals(list)
    }, (err) => console.error('referrals query failed:', err))
    return unsubscribe
  }, [ownerId])

  return { referrals }
}

export async function addReferral({ referrerMemberId, referredName, referredPhone }, ownerId) {
  return addDoc(collection(db, 'referrals'), {
    referrerMemberId,
    referredName,
    referredPhone,
    rewardStatus: 'pending',
    createdAt: new Date(),
    ownerId,
  })
}

export async function updateReferralStatus(id, status) {
  return updateDoc(doc(db, 'referrals', id), { rewardStatus: status })
}

export function referralsByMember(referrals, memberId) {
  return referrals.filter((r) => r.referrerMemberId === memberId)
}
