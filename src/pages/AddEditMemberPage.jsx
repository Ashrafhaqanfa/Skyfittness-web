import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserRound, Camera, ChevronUp, ChevronDown } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import { useMembers, addMember, updateMember } from '../services/members.js'
import { useCategoriesAndPlans, plansForCategory } from '../services/categoryPlans.js'

const emptyForm = {
  memberCode: '', name: '', address: '', gender: 'male', dialCode: '+91', phone: '',
  dateOfBirth: '', goal: '', heightCm: '', weightKg: '', isVIP: false,
  joinDate: new Date().toISOString().slice(0, 10),
  expiryDate: '', dueAmount: '', status: 'live',
  categoryId: '', planId: '', planAmount: '', paymentMode: 'cash', paidAmount: '',
  enrollmentFee: '0', discountType: 'None', discount: '', taxAmount: '0',
  dueAmountReminderDate: '', billDate: new Date().toISOString().slice(0, 10),
  batch: '', marriageAnniversary: '', email: '', homePhone: '', careOf: '',
  uniqueIdNumber: '', companyName: '', companyGST: '', remark: '',
}

export default function AddEditMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { members } = useMembers()
  const { categories, plans } = useCategoriesAndPlans()
  const [form, setForm] = useState(emptyForm)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [docPreviews, setDocPreviews] = useState([null, null, null])
  const [planSectionOpen, setPlanSectionOpen] = useState(true)
  const [otherSectionOpen, setOtherSectionOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    const m = members.find((mm) => mm.id === id)
    if (!m) return
    setForm({
      memberCode: m.memberCode || '', name: m.name || '', address: m.address || '',
      gender: m.gender || 'male', dialCode: m.dialCode || '+91', phone: m.phone || '',
      dateOfBirth: toInputDate(m.dateOfBirth), goal: m.goal || '',
      heightCm: m.heightCm ?? '', weightKg: m.weightKg ?? '', isVIP: !!m.isVIP,
      joinDate: toInputDate(m.joinDate) || emptyForm.joinDate,
      expiryDate: toInputDate(m.expiryDate), dueAmount: m.dueAmount ?? '',
      status: m.status || 'live', categoryId: m.categoryId || '', planId: m.planId || '',
      planAmount: '', paymentMode: 'cash', paidAmount: m.paidAmount ?? '',
      enrollmentFee: m.enrollmentFee ?? 0, discountType: m.discountType || 'None',
      discount: m.discountAmount ?? '', taxAmount: m.taxAmount ?? 0,
      dueAmountReminderDate: toInputDate(m.dueAmountReminderDate), billDate: emptyForm.billDate,
      batch: m.batch || '', marriageAnniversary: toInputDate(m.marriageAnniversary),
      email: m.email || '', homePhone: m.homePhone || '', careOf: m.careOf || '',
      uniqueIdNumber: m.uniqueIdNumber || '', companyName: m.companyName || '',
      companyGST: m.companyGST || '', remark: m.remark || '',
    })
  }, [isEdit, id, members])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function onPlanChange(planId) {
    set('planId', planId)
    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      set('planAmount', String(plan.price))
      set('dueAmount', String(plan.price))
      const start = new Date(form.joinDate)
      const expiry = new Date(start)
      expiry.setDate(expiry.getDate() + plan.durationDays)
      set('expiryDate', expiry.toISOString().slice(0, 10))
    }
  }

  function handleFile(setter, e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        memberCode: form.memberCode || null,
        name: form.name,
        address: form.address || null,
        gender: form.gender,
        dialCode: form.dialCode,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
        goal: form.goal || null,
        heightCm: form.heightCm === '' ? null : Number(form.heightCm),
        weightKg: form.weightKg === '' ? null : Number(form.weightKg),
        isVIP: form.isVIP,
        joinDate: new Date(form.joinDate),
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : new Date(),
        dueAmount: Number(form.dueAmount) || 0,
        status: form.status,
        categoryId: form.categoryId,
        planId: form.planId,
        email: form.email || null,
        enrollmentFee: Number(form.enrollmentFee) || 0,
        discountType: form.discountType === 'None' ? null : form.discountType,
        discountAmount: Number(form.discount) || 0,
        taxAmount: Number(form.taxAmount) || 0,
        paidAmount: Number(form.paidAmount) || 0,
        dueAmountReminderDate: form.dueAmountReminderDate ? new Date(form.dueAmountReminderDate) : null,
        batch: form.batch || null,
        marriageAnniversary: form.marriageAnniversary ? new Date(form.marriageAnniversary) : null,
        homePhone: form.homePhone || null,
        careOf: form.careOf || null,
        uniqueIdNumber: form.uniqueIdNumber || null,
        companyName: form.companyName || null,
        companyGST: form.companyGST || null,
        remark: form.remark || null,
      }
      if (isEdit) {
        await updateMember(id, payload)
      } else {
        await addMember(payload)
      }
      navigate(-1)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <TopBar title={isEdit ? 'Edit Member' : 'Add Member'} showBack />
      <form onSubmit={handleSave} className="p-4 space-y-4 pb-24">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 self-start">Select Image</p>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-4xl overflow-hidden">
              {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : <UserRound size={40} className="text-white" />}
            </div>
            <label className="absolute bottom-0 right-0 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(setAvatarPreview, e)} />
            </label>
          </div>
          <p className="text-[10px] text-gray-400 text-center px-6">
            Photo is stored only in this browser session — connect Firebase Storage to persist it.
          </p>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <input
              type="text" placeholder="Member ID" value={form.memberCode}
              onChange={(e) => set('memberCode', e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <span className="text-xs text-gray-400">available</span>
          </div>
          <Field placeholder="Name" value={form.name} onChange={(v) => set('name', v)} required />
          <Field placeholder="Address" value={form.address} onChange={(v) => set('address', v)} />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Gender</span>
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button
                  key={g} type="button" onClick={() => set('gender', g)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    form.gender === g ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {g === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <select value={form.dialCode} onChange={(e) => set('dialCode', e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-sm w-20">
              {['+91', '+1', '+44', '+971'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Field placeholder="Mobile" value={form.phone} onChange={(v) => set('phone', v)} type="tel" required />
          </div>

          <div className="flex gap-2">
            <DateField value={form.dateOfBirth} onChange={(v) => set('dateOfBirth', v)} placeholder="Date Of Birth" />
            <Field placeholder="Goal" value={form.goal} onChange={(v) => set('goal', v)} />
          </div>

          <div className="flex gap-2">
            <Field placeholder="Height (cm)" value={form.heightCm} onChange={(v) => set('heightCm', v)} type="number" />
            <Field placeholder="Weight (kg)" value={form.weightKg} onChange={(v) => set('weightKg', v)} type="number" />
          </div>

          <label className="flex items-start gap-2">
            <input type="checkbox" checked={form.isVIP} onChange={(e) => set('isVIP', e.target.checked)} className="mt-1" />
            <span>
              <span className="block text-sm font-semibold">VIP Member</span>
              <span className="block text-xs text-gray-500">Select this for VIP members. No plan is required.</span>
            </span>
          </label>
        </div>

        {/* Plan Details */}
        <Disclosure title="Plan Details" open={planSectionOpen} onToggle={() => setPlanSectionOpen((v) => !v)}>
          {categories.length === 0 ? (
            <p className="text-xs text-gray-500">
              No categories yet — go to More → Setup → Load sample categories & plans.
            </p>
          ) : (
            <>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="">Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.planId} onChange={(e) => onPlanChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="">Plan</option>
                {plansForCategory(plans, form.categoryId).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
                ))}
              </select>
            </>
          )}
          <Field placeholder="Plan Amount" value={form.planAmount} onChange={(v) => set('planAmount', v)} type="number" />
          <DateField value={form.joinDate} onChange={(v) => set('joinDate', v)} placeholder="Start Date" />
          <DateField value={form.expiryDate} onChange={(v) => set('expiryDate', v)} placeholder="Expiry Date" />
          <select value={form.paymentMode} onChange={(e) => set('paymentMode', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
            {['cash', 'upi', 'card', 'other'].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
          </select>
          <Field placeholder="Paid Amount" value={form.paidAmount} onChange={(v) => set('paidAmount', v)} type="number" />
          <Field placeholder="Enrollment Fee" value={form.enrollmentFee} onChange={(v) => set('enrollmentFee', v)} type="number" />
          <select value={form.discountType} onChange={(e) => set('discountType', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
            {['None', 'Flat', 'Percentage'].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Field placeholder="Discount" value={form.discount} onChange={(v) => set('discount', v)} type="number" />
          <Field placeholder="Tax Amount" value={form.taxAmount} onChange={(v) => set('taxAmount', v)} type="number" />
          <Field placeholder="Due Amount" value={form.dueAmount} onChange={(v) => set('dueAmount', v)} type="number" />
          <DateField value={form.dueAmountReminderDate} onChange={(v) => set('dueAmountReminderDate', v)} placeholder="Due Amount Reminder" />
          <DateField value={form.billDate} onChange={(v) => set('billDate', v)} placeholder="Bill Date" />
        </Disclosure>

        {/* Other Details */}
        <Disclosure title="Other Details" open={otherSectionOpen} onToggle={() => setOtherSectionOpen((v) => !v)}>
          <p className="text-sm font-semibold">Upload Documents</p>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                {docPreviews[i] ? (
                  <img src={docPreviews[i]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">Doc {i + 1}</span>
                )}
                <label className="absolute bottom-1 right-1 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">
                  <Camera size={11} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) =>
                    handleFile((val) => setDocPreviews((prev) => prev.map((p, idx) => (idx === i ? val : p))), e)
                  } />
                </label>
              </div>
            ))}
          </div>
          <select value={form.batch} onChange={(e) => set('batch', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">Batch</option>
            {['Morning', 'Afternoon', 'Evening', 'General'].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <DateField value={form.marriageAnniversary} onChange={(v) => set('marriageAnniversary', v)} placeholder="Marriage Anniversary" />
          <Field placeholder="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Field placeholder="Home Phone" value={form.homePhone} onChange={(v) => set('homePhone', v)} type="tel" />
          <Field placeholder="Care Of (c/o)" value={form.careOf} onChange={(v) => set('careOf', v)} />
          <Field placeholder="Unique ID Number" value={form.uniqueIdNumber} onChange={(v) => set('uniqueIdNumber', v)} />
          <Field placeholder="Place of Work / Company Name" value={form.companyName} onChange={(v) => set('companyName', v)} />
          <Field placeholder="Company GST" value={form.companyGST} onChange={(v) => set('companyGST', v)} />
          <Field placeholder="Remark" value={form.remark} onChange={(v) => set('remark', v)} />
        </Disclosure>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-accent text-white font-semibold py-3 rounded-xl disabled:opacity-60">
          {saving ? 'Saving…' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

function Field({ placeholder, value, onChange, type = 'text', required = false }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value ?? ''} required={required}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
    />
  )
}

function DateField({ value, onChange, placeholder }) {
  return (
    <label className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-sm">
      <span className={value ? 'text-gray-800' : 'text-gray-400'}>{placeholder}</span>
      <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className="text-right bg-transparent outline-none" />
    </label>
  )
}

function Disclosure({ title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between">
        <span className="font-semibold text-sm">{title}</span>
        <span className="text-gray-400">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  )
}

function toInputDate(date) {
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}
