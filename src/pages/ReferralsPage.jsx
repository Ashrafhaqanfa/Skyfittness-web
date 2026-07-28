import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { useMembers } from '../services/members.js'
import { useReferrals, addReferral, updateReferralStatus } from '../services/referrals.js'
import { Plus, X, Gift } from 'lucide-react'

const statusColor = {
  pending: 'text-blue-600 bg-blue-100',
  converted: 'text-orange-600 bg-orange-100',
  rewarded: 'text-green-600 bg-green-100',
}

export default function ReferralsPage() {
  const { members } = useMembers()
  const { referrals } = useReferrals()
  const [showForm, setShowForm] = useState(false)
  const [referrerMemberId, setReferrerMemberId] = useState('')
  const [referredName, setReferredName] = useState('')
  const [referredPhone, setReferredPhone] = useState('')
  const [saving, setSaving] = useState(false)

  function memberName(id) {
    return members.find((m) => m.id === id)?.name || 'Unknown'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await addReferral({ referrerMemberId, referredName, referredPhone })
    setReferredName('')
    setReferredPhone('')
    setReferrerMemberId('')
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div>
      <TopBar
        title="Refer & Earn"
        showBack
        right={<button onClick={() => setShowForm((v) => !v)}>{showForm ? <X size={20} /> : <Plus size={20} />}</button>}
      />
      <div className="p-4 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <select value={referrerMemberId} onChange={(e) => setReferrerMemberId(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="">Referred by (member)</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="text" placeholder="Referred person's name" value={referredName} onChange={(e) => setReferredName(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <input type="tel" placeholder="Referred person's phone" value={referredPhone} onChange={(e) => setReferredPhone(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Log Referral'}
            </button>
          </form>
        )}

        {referrals.length === 0 ? (
          <div className="text-center py-10">
            <Gift size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold">No referrals yet</p>
            <p className="text-sm text-gray-400">Tap + to log a member's referral.</p>
          </div>
        ) : (
          referrals.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">{r.referredName}</p>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusColor[r.rewardStatus]}`}>
                  {r.rewardStatus}
                </span>
              </div>
              <p className="text-xs text-gray-400">Referred by: {memberName(r.referrerMemberId)}</p>
              <p className="text-xs text-gray-400">{r.referredPhone}</p>
              {r.rewardStatus !== 'rewarded' && (
                <select
                  value={r.rewardStatus}
                  onChange={(e) => updateReferralStatus(r.id, e.target.value)}
                  className="mt-2 text-xs border border-gray-200 rounded-lg px-2 py-1"
                >
                  {['pending', 'converted', 'rewarded'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
