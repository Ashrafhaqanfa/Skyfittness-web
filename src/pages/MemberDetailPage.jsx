import { useNavigate, useParams, Link } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { useMembers, expiryBucket, deleteMember } from '../services/members.js'
import { usePayments } from '../services/payments.js'
import { useDietPlans, dietPlansForMember } from '../services/dietPlans.js'
import { useReferrals, referralsByMember } from '../services/referrals.js'

export default function MemberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members } = useMembers()
  const { payments } = usePayments()
  const { dietPlans } = useDietPlans()
  const { referrals } = useReferrals()

  const member = members.find((m) => m.id === id)
  if (!member) {
    return (
      <div>
        <TopBar title="Member" showBack />
        <p className="p-6 text-center text-sm text-gray-400">Member not found (or still loading).</p>
      </div>
    )
  }

  const memberPayments = payments.filter((p) => p.memberId === id)
  const memberDietPlans = dietPlansForMember(dietPlans, id)
  const memberReferrals = referralsByMember(referrals, id)

  async function handleDelete() {
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return
    await deleteMember(id)
    navigate('/members')
  }

  return (
    <div>
      <TopBar title={member.name} showBack />
      <div className="p-4 space-y-4 pb-10">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{member.name}</h2>
            <BucketBadge member={member} />
          </div>
          <p className="text-sm text-gray-500">{member.dialCode} {member.phone}</p>
          {member.email && <p className="text-sm text-gray-500">{member.email}</p>}
          {member.address && <p className="text-sm text-gray-500">{member.address}</p>}
          <div className="grid grid-cols-2 gap-2 pt-3 text-sm">
            <InfoRow label="Expiry" value={member.expiryDate?.toLocaleDateString()} />
            <InfoRow label="Due Amount" value={`₹${member.dueAmount}`} />
            <InfoRow label="Goal" value={member.goal || '—'} />
            <InfoRow label="Batch" value={member.batch || '—'} />
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/members/${id}/record-payment`} className="flex-1 bg-accent text-white text-center py-2.5 rounded-xl font-semibold text-sm">
            Record Payment
          </Link>
          <Link to={`/members/${id}/edit`} className="flex-1 bg-gray-100 text-gray-700 text-center py-2.5 rounded-xl font-semibold text-sm">
            Edit
          </Link>
        </div>

        <Section title={`Payment History (${memberPayments.length})`}>
          {memberPayments.length === 0 ? (
            <Empty text="No payments yet." />
          ) : (
            memberPayments.map((p) => (
              <Row key={p.id} left={p.paymentDate.toLocaleDateString()} right={`₹${p.amount} (${p.mode})`} />
            ))
          )}
        </Section>

        <Section title={`Diet Plans (${memberDietPlans.length})`}>
          {memberDietPlans.length === 0 ? (
            <Empty text="No diet plans assigned." />
          ) : (
            memberDietPlans.map((d) => <Row key={d.id} left={d.title} right={d.createdAt.toLocaleDateString()} />)
          )}
        </Section>

        <Section title={`Referrals made (${memberReferrals.length})`}>
          {memberReferrals.length === 0 ? (
            <Empty text="No referrals from this member yet." />
          ) : (
            memberReferrals.map((r) => <Row key={r.id} left={r.referredName} right={r.rewardStatus} />)
          )}
        </Section>

        <button onClick={handleDelete} className="w-full text-red-500 text-sm font-semibold py-3">
          Delete Member
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  )
}

function Row({ left, right }) {
  return (
    <div className="flex justify-between text-sm border-b border-gray-100 last:border-0 py-2">
      <span>{left}</span>
      <span className="text-gray-500">{right}</span>
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-xs text-gray-400 py-2">{text}</p>
}

function BucketBadge({ member }) {
  const bucket = expiryBucket(member)
  const map = {
    expired: ['Expired', 'bg-red-100 text-red-600'],
    expiring1to3: ['1-3 days', 'bg-orange-100 text-orange-600'],
    expiring4to7: ['4-7 days', 'bg-yellow-100 text-yellow-700'],
    expiring8to15: ['8-15 days', 'bg-yellow-50 text-yellow-600'],
    notExpiringSoon: ['Active', 'bg-green-100 text-green-600'],
  }
  const [label, cls] = map[bucket] || map.notExpiringSoon
  return <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cls}`}>{label}</span>
}
