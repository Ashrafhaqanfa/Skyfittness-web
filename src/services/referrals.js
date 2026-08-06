// src/services/referrals.js

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
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
    createdAt: toDate(raw.createdAt) || new Date(),
    updatedAt: toDate(raw.updatedAt),
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
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReferrals(
          snapshot.docs.map((doc) => normalize(mapDoc(doc)))
        )
      },
      (err) => console.error(err)
    )

    return unsubscribe
  }, [ownerId])

  return { referrals }
}

export async function addReferral(
  {
    referrerMemberId,
    referredName,
    referredPhone,
  },
  ownerId
) {
  return addDoc(collection(db, 'referrals'), {
    referrerMemberId,
    referredName,
    referredPhone,
    rewardStatus: 'pending',
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function updateReferralStatus(
  id,
  status,
  ownerId
) {
  const ref = doc(db, 'referrals', id)

  const snap = await getDoc(ref)

  if (!snap.exists()) {
    throw new Error('Referral not found.')
  }

  if (snap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized.')
  }

  await updateDoc(ref, {
    rewardStatus: status,
    updatedAt: new Date(),
  })
}

export function referralsByMember(referrals, memberId) {
  return referrals.filter(
    (referral) =>
      referral.referrerMemberId === memberId
  )
}
