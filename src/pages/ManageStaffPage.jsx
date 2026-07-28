import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { useAdmins, addStaff } from '../services/admins.js'
import { Plus, X, Lock } from 'lucide-react'

export default function ManageStaffPage() {
  const { currentAdmin } = useAuth()
  const { admins } = useAdmins()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('staff')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (currentAdmin?.role !== 'owner') {
    return (
      <div>
        <TopBar title="Manage Staff" showBack />
        <div className="text-center py-16 px-6">
          <Lock size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="font-semibold">Owner access only</p>
          <p className="text-sm text-gray-400 mt-1">Only the gym owner account can manage staff and trainers.</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addStaff({ name, email, password, role })
      setName(''); setEmail(''); setPassword(''); setRole('staff')
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <TopBar
        title="Manage Staff"
        showBack
        right={<button onClick={() => setShowForm((v) => !v)}>{showForm ? <X size={20} /> : <Plus size={20} />}</button>}
      />
      <div className="p-4 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <input type="password" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="staff">Staff</option>
              <option value="trainer">Trainer</option>
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Add Staff'}
            </button>
          </form>
        )}

        {admins.map((a) => (
          <div key={a.id} className="bg-white rounded-xl p-3 shadow-sm">
            <p className="font-semibold text-sm">{a.name}</p>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{a.loginEmail}</span>
              <span className="bg-accent-light text-accent font-semibold px-2 py-0.5 rounded-full">
                {a.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
