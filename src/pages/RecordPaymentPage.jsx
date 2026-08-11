// src/pages/RecordPaymentPage.jsx
//
// Ports Views/RecordPaymentView.swift — after a payment is saved, a PDF
// receipt is generated automatically (SKYFITNESS invoice-style, see
// services/receipts.js) and offered for download/share before the screen
// closes.

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useMembers } from '../services/members.js'
import { recordPayment } from '../services/payments.js'
import { generateReceiptPDF } from '../services/receipts.js'

export default function RecordPaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ownerId } = useAuth()
  const { members } = useMembers()
  const member = members.find((m) => m.id === id)

  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('cash')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [receiptFilename, setReceiptFilename] = useState(null)
  const [receiptPayment, setReceiptPayment] = useState(null)
  const [receiptDueBefore, setReceiptDueBefore] = useState(0)

  if (!member) {
    return (
      <div>
        <TopBar title="Record Payment" showBack />
        <p className="p-6 text-center text-sm text-gray-400">Member not found (or still loading).</p>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const dueBefore = member.dueAmount || 0
      const amountNum = Number(amount)
      const dueAfter = Math.max(0, dueBefore - amountNum)

      const savedPayment = await recordPayment({
        memberId: id,
        amount: amountNum,
        mode,
        collectedBy: null,
        currentDueAmount: dueBefore,
        ownerId,
      })

      const filename = generateReceiptPDF(member, savedPayment, dueBefore, dueAfter)
      setReceiptFilename(filename)
      setReceiptPayment(savedPayment)
      setReceiptDueBefore(dueBefore)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  function handleShareAgain() {
    const dueAfter = Math.max(0, receiptDueBefore - receiptPayment.amount)
    generateReceiptPDF(member, receiptPayment, receiptDueBefore, dueAfter)
  }

  return (
    <div>
      <TopBar title="Record Payment" showBack />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Member</p>
          <p className="font-semibold">{member.name}</p>
          <p className="text-sm mt-2">
            Current due: <span className="font-semibold text-red-500">₹{member.dueAmount}</span>
          </p>
        </div>

        {!receiptFilename && (
          <>
            <input
              type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)}
              required min="1"
              className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm"
            />

            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm">
              {['cash', 'upi', 'card', 'other'].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {receiptFilename ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-green-700">
              Payment saved. A PDF receipt was generated automatically ({receiptFilename}) and should already be in
              your Downloads.
            </p>
            <button
              type="button"
              onClick={handleShareAgain}
              className="w-full bg-accent text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
            >
              <Download size={16} /> Download Receipt Again
            </button>
            <button
              type="button"
              onClick={() => navigate(`/members/${id}`)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-3 rounded-xl disabled:opacity-60">
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        )}
      </form>
    </div>
  )
}
