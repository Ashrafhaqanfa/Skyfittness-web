import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { useMembers } from '../services/members.js'
import { useDietPlans, addDietPlan, deleteDietPlan } from '../services/dietPlans.js'
import { Plus, X, UtensilsCrossed } from 'lucide-react'

export default function DietPlansPage() {
  const { members } = useMembers()
  const { dietPlans } = useDietPlans()
  const [showForm, setShowForm] = useState(false)
  const [memberId, setMemberId] = useState('')
  const [title, setTitle] = useState('')
  const [planDetails, setPlanDetails] = useState('')
  const [saving, setSaving] = useState(false)

  function memberName(id) {
    return members.find((m) => m.id === id)?.name || 'Unknown'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await addDietPlan({ memberId, title, planDetails, assignedBy: null })
    setTitle('')
    setPlanDetails('')
    setMemberId('')
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div>
      <TopBar
        title="Diet Plans"
        showBack
        right={<button onClick={() => setShowForm((v) => !v)}>{showForm ? <X size={20} /> : <Plus size={20} />}</button>}
      />
      <div className="p-4 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="">Select member</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="text" placeholder="Title (e.g. Weight Loss Plan)" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <textarea placeholder="Plan details" value={planDetails} onChange={(e) => setPlanDetails(e.target.value)} rows={4} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Assign Plan'}
            </button>
          </form>
        )}

        {dietPlans.length === 0 ? (
          <div className="text-center py-10">
            <UtensilsCrossed size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold">No diet plans assigned</p>
            <p className="text-sm text-gray-400">Tap + to assign one.</p>
          </div>
        ) : (
          dietPlans.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-gray-400">{memberName(p.memberId)}</p>
                </div>
                <button onClick={() => deleteDietPlan(p.id)} className="text-red-500 text-xs font-semibold">Delete</button>
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{p.planDetails}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
