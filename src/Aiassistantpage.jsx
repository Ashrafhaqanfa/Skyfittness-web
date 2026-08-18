// src/pages/AIAssistantPage.jsx
//
// "AI Assistant" — a keyword/command navigator, not a language model. Type
// what you want ("add member", "who's expiring soon", "record a payment")
// and it jumps you to the right screen, plus a couple of quick built-in
// answers for common questions.
//
// NOTE ON SCOPE: a true LLM-backed assistant needs a backend call (an API
// key can't safely live in browser code), which would mean adding a Cloud
// Function back — something explicitly ruled out earlier. This is the
// honest, no-backend version of "help me get to the right place fast."

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Search } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'

const COMMANDS = [
  { keywords: ['add member', 'new member', 'register', 'sign up member'], label: 'Add a new member', to: '/members/new' },
  { keywords: ['member', 'members', 'members list'], label: 'View Members', to: '/members' },
  { keywords: ['expiring', 'expire', 'renew'], label: 'Members expiring soon', to: '/members?filter=expiringSoon' },
  { keywords: ['due', 'unpaid', 'outstanding'], label: 'Members with due amount', to: '/members?filter=due' },
  { keywords: ['trainer', 'personal training'], label: 'Trainer plan members', to: '/members?filter=trainer' },
  { keywords: ['payment', 'record payment', 'collect'], label: 'Payments', to: '/payments' },
  { keywords: ['attendance', 'check in', 'checkin'], label: 'Attendance', to: '/attendance' },
  { keywords: ['enquiry', 'enquiries', 'lead', 'leads'], label: 'Enquiries', to: '/enquiries' },
  { keywords: ['diet', 'nutrition'], label: 'Diet Plans', to: '/diet-plans' },
  { keywords: ['refer', 'referral'], label: 'Refer & Earn', to: '/referrals' },
  { keywords: ['report', 'balance sheet', 'monthly total'], label: 'Reports', to: '/reports' },
  { keywords: ['qr', 'qr code'], label: 'Generate QR Code', to: '/generate-qr' },
  { keywords: ['dashboard', 'home'], label: 'Dashboard', to: '/' },
  { keywords: ['settings', 'more', 'logout', 'sign out'], label: 'More', to: '/more' },
]

const QUICK_ANSWERS = [
  {
    q: 'How do I add a new member?',
    a: 'Tap the + icon on the Dashboard, or go to Members → +. Fill in their details, pick a Plan Duration, and Submit.',
  },
  {
    q: 'How do I see who owes money?',
    a: 'Go to Members, then tap the "Has Due" filter chip — or check the "Due Amount" tile on the Dashboard.',
  },
  {
    q: 'How do I generate a payment receipt?',
    a: 'Open a member → Record Payment → fill in the amount → Record Payment. A PDF receipt downloads automatically.',
  },
  {
    q: 'How do I add a walk-in via QR code?',
    a: 'Go to More → Generate QR Code, then print or display it. Scanning it (while signed in) opens Add Member directly.',
  },
]

export default function AIAssistantPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return COMMANDS.filter((c) => c.keywords.some((k) => k.includes(q) || q.includes(k)))
  }, [query])

  return (
    <div>
      <TopBar title="AI Assistant" showBack />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles size={18} />
            <p className="font-semibold text-sm">Tell me what you're trying to do</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. add member, who's due, record payment…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm"
              autoFocus
            />
          </div>

          {matches.length > 0 && (
            <div className="space-y-1.5">
              {matches.map((m) => (
                <button
                  key={m.to}
                  onClick={() => navigate(m.to)}
                  className="w-full flex items-center justify-between bg-accent-light text-accent rounded-xl px-3 py-2.5 text-sm font-semibold"
                >
                  {m.label}
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          )}

          {query && matches.length === 0 && (
            <p className="text-xs text-gray-400">
              No matching page found — try a simpler word like "members", "payments", or "attendance".
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Common questions</p>
          <div className="space-y-2">
            {QUICK_ANSWERS.map((qa) => (
              <div key={qa.q} className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-sm font-semibold">{qa.q}</p>
                <p className="text-xs text-gray-500 mt-1">{qa.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center px-4">
          This assistant matches keywords to jump you to the right screen — it's not a chatbot that understands
          anything you type.
        </p>
      </div>
    </div>
  )
}
