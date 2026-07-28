import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { useEnquiries, addEnquiry, updateEnquiry } from '../services/enquiries.js'

export default function AddEditEnquiryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { enquiries } = useEnquiries()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [interestCategory, setInterestCategory] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [status, setStatus] = useState('new')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    const e = enquiries.find((en) => en.id === id)
    if (!e) return
    setName(e.name || '')
    setPhone(e.phone || '')
    setInterestCategory(e.interestCategory || '')
    setFollowUpDate(e.followUpDate ? e.followUpDate.toISOString().slice(0, 10) : '')
    setStatus(e.status || 'new')
    setNotes(e.notes || '')
  }, [isEdit, id, enquiries])

  async function handleSubmit(ev) {
    ev.preventDefault()
    setSaving(true)
    const payload = {
      name, phone,
      interestCategory: interestCategory || null,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      status, notes: notes || null,
    }
    if (isEdit) {
      await updateEnquiry(id, payload)
    } else {
      await addEnquiry(payload)
    }
    setSaving(false)
    navigate('/enquiries')
  }

  return (
    <div>
      <TopBar title={isEdit ? 'Edit Enquiry' : 'Add Enquiry'} showBack />
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm" />
        <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm" />
        <input type="text" placeholder="Interest Category (e.g. Yoga)" value={interestCategory} onChange={(e) => setInterestCategory(e.target.value)}
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm" />
        <label className="flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm">
          <span className={followUpDate ? '' : 'text-gray-400'}>Follow-up Date</span>
          <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="bg-transparent outline-none" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm">
          {['new', 'contacted', 'converted', 'lost'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm" />
        <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-3 rounded-xl disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
