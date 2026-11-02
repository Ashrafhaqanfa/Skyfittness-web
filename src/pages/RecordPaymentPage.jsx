// src/pages/RecordPaymentPage.jsx
//
// Ports Views/RecordPaymentView.swift — after a payment is saved, a PDF
// receipt is generated automatically (SKYFITNESS invoice-style, see
// services/receipts.js) and offered for download/share before the screen
// closes.

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { Download, Share2, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useMembers } from '../services/members.js'
import { recordPayment } from '../services/payments.js'
import { generateReceiptPDF, shareReceiptPDF, getWhatsAppShareUrl } from '../services/receipts.js'

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

      // Generate the receipt right away
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
    shareReceiptPDF(member, receiptPayment, receiptDueBefore, dueAfter)
  }

  const dueAfter = receiptPayment ? Math.max(0, receiptDueBefore - receiptPayment.amount) : 0

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
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-green-800">
              Payment saved successfully! A PDF receipt ({receiptFilename}) was generated and downloaded.
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleShareAgain}
                className="w-full bg-accent text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 size={16} /> Share Receipt (PDF)
              </button>

              <a
                href={getWhatsAppShareUrl(member, receiptPayment, dueAfter)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare size={16} /> Share on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => generateReceiptPDF(member, receiptPayment, receiptDueBefore, dueAfter)}
                className="w-full bg-white text-gray-700 border border-gray-200 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-gray-50"
              >
                <Download size={15} /> Download PDF Again
              </button>

              <button
                type="button"
                onClick={() => navigate(`/members/${id}`)}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-200"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-3 rounded-xl disabled:opacity-60 shadow-md">
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        )}
      </form>
    </div>
  )
}
