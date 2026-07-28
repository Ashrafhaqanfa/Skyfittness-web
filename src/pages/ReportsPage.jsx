import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { useMembers } from '../services/members.js'
import { usePayments, totalCollection } from '../services/payments.js'
import { generateBalanceSheetPDF } from '../services/reports.js'
import { Download } from 'lucide-react'

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
)

export default function ReportsPage() {
  const { members } = useMembers()
  const { payments } = usePayments()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [gymName, setGymName] = useState('My Gym')

  return (
    <div>
      <TopBar title="Reports" showBack />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700">Monthly Balance Sheet</p>
          <input type="text" placeholder="Gym name (for PDF header)" value={gymName} onChange={(e) => setGymName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm">
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-between text-sm">
            <span>Total collected this month</span>
            <span className="font-semibold">₹{totalCollection(payments, month, year).toFixed(0)}</span>
          </div>
          <button
            onClick={() => generateBalanceSheetPDF(gymName, members, payments, month, year)}
            className="w-full bg-accent text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            <span className="inline-flex items-center gap-1.5"><Download size={16} /> Download Monthly Balance Sheet (PDF)</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2 text-sm text-gray-500">
          <p className="font-semibold text-gray-700">At a glance</p>
          <div className="flex justify-between"><span>Total members</span><span>{members.length}</span></div>
          <div className="flex justify-between"><span>Total payments recorded</span><span>{payments.length}</span></div>
          <div className="flex justify-between"><span>All-time collection</span><span>₹{totalCollection(payments).toFixed(0)}</span></div>
        </div>
      </div>
    </div>
  )
}
