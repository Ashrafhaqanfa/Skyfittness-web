// src/services/firestoreUtils.js
//
// Firestore stores dates as Timestamp objects; this converts them (or ISO
// strings) into plain JS Date objects so the rest of the app can just use
// normal Date methods everywhere, same as Swift's `Date` type did.

export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  return new Date(value)
}

export function mapDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() }
}
