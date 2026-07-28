import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/BottomNav.jsx'
import { useMembers } from '../services/members.js'
import { usePayments, todaysCollection, totalCollection, paymentsOnDate, totalCollectionOnDate } from '../services/payments.js'
import { generateDailyBalanceSheetPDF } from '../services/reports.js'
import { useGymName } from '../hooks/useGymName.js'
import { Download } from 'lucide-react'

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
)

export default function PaymentsPage() {
  const { members } = useMembers()
  const { payments } = usePayments()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = useState(now.toISOString().slice(0, 10))
  const [gymName] = useGymName()

  const totalDue = members.reduce((sum, m) => sum + (m.dueAmount || 0), 0)
  const dateObj = new Date(selectedDate)
  const dayPayments = paymentsOnDate(payments, dateObj)

  function memberName(mid) {
    return members.find((m) => m.id === mid)?.name || 'Unknown member'
  }

  function downloadDaily() {
    generateDailyBalanceSheetPDF(gymName, members, payments, dateObj)
  }

  return (
    <div className="pb-4">
      <TopBar title="Payments" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between">
          <div>
            <p className="text-xs text-gray-400">Today's Collection</p>
            <p className="text-xl font-bold">₹{todaysCollection(payments).toFixed(0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Due (all members)</p>
            <p className="text-xl font-bold text-red-500">₹{totalDue.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-gray-700">Monthly Filter</p>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <div className="flex justify-between text-sm pt-1">
            <span>Monthly Total</span>
            <span className="font-semibold">₹{totalCollection(payments, month, year).toFixed(0)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700">Payments by Date</p>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <div className="flex justify-between text-sm">
            <span>Total collected on this day</span>
            <span className="font-semibold">₹{totalCollectionOnDate(payments, dateObj).toFixed(0)}</span>
          </div>

          {dayPayments.length === 0 ? (
            <p className="text-xs text-gray-400">No payments recorded on {dateObj.toLocaleDateString()}</p>
          ) : (
            <div className="space-y-1">
              {dayPayments.map((p) => (
                <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 py-1.5 last:border-0">
                  <span>{memberName(p.memberId)}</span>
                  <span className="text-gray-500">₹{p.amount} ({p.mode})</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={downloadDaily} className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-xl">
            <span className="inline-flex items-center gap-1.5"><Download size={16} /> Download Balance Sheet for this day</span>
          </button>
          <p className="text-[11px] text-gray-400">
            Pick any day above to see just that day's payments and download a PDF balance sheet for it.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-gray-700">Recent Payments (Balance Sheet)</p>
          {payments.length === 0 ? (
            <p className="text-xs text-gray-400">No payments recorded yet</p>
          ) : (
            payments.slice(0, 50).map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 py-1.5 last:border-0">
                <span>{memberName(p.memberId)}</span>
                <span className="text-gray-500">₹{p.amount} ({p.mode})</span>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
