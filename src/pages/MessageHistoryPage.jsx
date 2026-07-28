// src/pages/MessageHistoryPage.jsx
//
// Shared full-page component for "SMS History" and "WhatsApp History" —
// matches the exact native-app screens: blue top bar with back arrow,
// centered "No Message History" card, and the same persistent
// "No Plans Found" banner shown at the bottom whenever no categories/plans
// exist yet (same condition used on Add Member).

import { useLocation } from 'react-router-dom'
import { Clock } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import { useCategoriesAndPlans } from '../services/categoryPlans.js'

export default function MessageHistoryPage() {
  const { pathname } = useLocation()
  const isWhatsApp = pathname.includes('whatsapp')
  const title = isWhatsApp ? 'WhatsApp History' : 'SMS History'
  const { categories } = useCategoriesAndPlans()

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar title={title} showBack />

      <div className="flex-1 flex items-start justify-center pt-24 px-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center w-full max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <Clock size={26} />
          </div>
          <p className="font-bold text-lg mb-1">No Message History</p>
          <p className="text-sm text-gray-500">Message History not found.</p>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="sticky bottom-0 bg-red-500 text-white text-sm px-4 py-3 flex items-center justify-between">
          <span>No Plans Found! First create your plans to add a member.</span>
          <a href="/more" className="font-semibold whitespace-nowrap ml-2">Add Plan</a>
        </div>
      )}
    </div>
  )
}
