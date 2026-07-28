// src/services/referrals.js
//
// Ports Services/ReferralService.swift. Firestore collection: "referrals"

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
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
    createdAt: toDate(raw.createdAt) || new Date(),
    rewardStatus: raw.rewardStatus || 'pending',
  }
}

export function useReferrals() {
  const [referrals, setReferrals] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReferrals(snapshot.docs.map((d) => normalize(mapDoc(d))))
    })
    return unsubscribe
  }, [])

  return { referrals }
}

export async function addReferral({ referrerMemberId, referredName, referredPhone }) {
  return addDoc(collection(db, 'referrals'), {
    referrerMemberId,
    referredName,
    referredPhone,
    rewardStatus: 'pending',
    createdAt: new Date(),
  })
}

export async function updateReferralStatus(id, status) {
  return updateDoc(doc(db, 'referrals', id), { rewardStatus: status })
}

export function referralsByMember(referrals, memberId) {
  return referrals.filter((r) => r.referrerMemberId === memberId)
}
