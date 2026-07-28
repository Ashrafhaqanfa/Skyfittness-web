// src/hooks/useGymName.js
//
// Ports @AppStorage("gymName") from RecordPaymentView.swift / PaymentsView.swift —
// a small persisted setting shared across screens. localStorage is the
// correct web equivalent of @AppStorage's UserDefaults-backed persistence.

import { useState, useEffect } from 'react'

const KEY = 'gymName'
const DEFAULT = 'My Gym'

export function useGymName() {
  const [gymName, setGymNameState] = useState(() => {
    try {
      return localStorage.getItem(KEY) || DEFAULT
    } catch {
      return DEFAULT
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, gymName)
    } catch {
      // ignore (e.g. private browsing mode blocking storage)
    }
  }, [gymName])

  return [gymName, setGymNameState]
}
