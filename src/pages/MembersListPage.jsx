import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/BottomNav.jsx'
import {
  useMembers, isExpired, expiryBucket, daysUntilExpiry, isBirthdayToday, isAnniversaryToday, derivePlanLabel, deleteMember,
} from '../services/members.js'
import {
  UserPlus, Users, UserCheck, UserX, HelpCircle, AlertTriangle, Wallet,
  BellRing, Cake, Heart, Dumbbell, Calendar, Trash2, MoreVertical
} from 'lucide-react'

const filters = [
  { key: 'all', label: 'All', Icon: Users },
  { key: 'live', label: 'Live', Icon: UserCheck },
  { key: 'expired', label: 'Expired', Icon: UserX },
  { key: 'expiringSoon', label: 'Expiring Soon', Icon: AlertTriangle },
  { key: 'expiring1to3', label: '1-3 Days', Icon: AlertTriangle },
  { key: 'expiring4to7', label: '4-7 Days', Icon: AlertTriangle },
  { key: 'expiring8to15', label: '8-15 Days', Icon: AlertTriangle },
  { key: 'demo', label: 'Demo', Icon: HelpCircle },
  { key: 'due', label: 'Has Due', Icon: Wallet },
  { key: 'dueReminder', label: 'Due Reminder Today', Icon: BellRing },
  { key: 'birthday', label: 'Birthday Today', Icon: Cake },
  { key: 'anniversary', label: 'Anniversary Today', Icon: Heart },
  { key: 'trainer', label: 'Trainer Plans', Icon: Dumbbell },
]

function matchesFilter(m, filterKey) {
  switch (filterKey) {
    case 'all': return true
    case 'live': return m.status === 'live' && !isExpired(m)
    case 'expired': return isExpired(m)
    case 'demo': return m.status === 'demo'
    case 'expiring1to3': return expiryBucket(m) === 'expiring1to3'
    case 'expiring4to7': return expiryBucket(m) === 'expiring4to7'
    case 'expiring8to15': return expiryBucket(m) === 'expiring8to15'
    case 'expiringSoon': {
      const b = expiryBucket(m)
      return b === 'expiring1to3' || b === 'expiring4to7' || b === 'expiring8to15'
    }
    case 'due': return (m.dueAmount || 0) > 0
    case 'dueReminder': {
      if (!m.dueAmountReminderDate) return false
      const t = new Date()
      return (
        m.dueAmountReminderDate.getFullYear() === t.getFullYear() &&
        m.dueAmountReminderDate.getMonth() === t.getMonth() &&
        m.dueAmountReminderDate.getDate() === t.getDate()
      )
    }
    case 'birthday': return isBirthdayToday(m)
    case 'anniversary': return isAnniversaryToday(m)
    case 'trainer': return m.planType === 'trainer' || m.planType === 'premiumTrainer'
    default: return true
  }
}

function formatExpiry(date) {
  if (!date) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MembersListPage() {
  const { members, loading } = useMembers()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fromUrl = searchParams.get('filter')
    if (fromUrl && fromUrl !== filter) setFilter(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const filtered = members
    .filter((m) => matchesFilter(m, filter))
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search))

  const activeFilterLabel = filters.find((f) => f.key === filter)?.label || 'All'

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteMember(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      console.error('delete member failed:', err)
    }
    setDeleting(false)
  }

  return (
    <div>
      <TopBar
        title="Members"
        right={
          <Link to="/members/new" className="text-xl">
            <UserPlus size={20} />
          </Link>
        }
      />

      <div className="p-4 space-y-3 pb-24">
        <input
          type="text"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm shadow-sm"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-accent text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <f.Icon size={14} /> {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>
            Showing <span className="font-semibold text-gray-600">{activeFilterLabel}</span> — {filtered.length} member(s)
          </span>
          <span className="text-[11px] text-gray-400 italic">
            Long-press to delete
          </span>
        </div>

        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No members found for this filter.</p>
        )}

        <div className="space-y-2.5">
          {filtered.map((m) => (
            <MemberCard key={m.id} member={m} onLongPress={setPendingDelete} />
          ))}
        </div>
      </div>

      <BottomNav />

      {/* Delete Member Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 size={28} />
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900">Delete Member?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{pendingDelete.name}</span>?
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-left space-y-1.5 text-xs text-gray-600 border border-gray-100">
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-medium text-gray-800">{pendingDelete.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiry Date:</span>
                <span className="font-medium text-gray-800">{formatExpiry(pendingDelete.expiryDate) || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Due:</span>
                <span className="font-semibold text-red-500">₹{pendingDelete.dueAmount || 0}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              This action cannot be undone. All membership and record history will be removed.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MemberCard({ member, onLongPress }) {
  const timerRef = useRef(null)
  const firedRef = useRef(false)
  const [isPressing, setIsPressing] = useState(false)

  function startPress() {
    firedRef.current = false
    setIsPressing(true)
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      setIsPressing(false)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50)
      }
      onLongPress(member)
    }, 500) // 500ms for responsive long press
  }

  function cancelPress() {
    setIsPressing(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function handleClick(e) {
    if (firedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      firedRef.current = false
    }
  }

  function handleContextMenu(e) {
    e.preventDefault()
    cancelPress()
    onLongPress(member)
  }

  // Calculate expiry status & days left
  const days = daysUntilExpiry(member)
  const isExp = isExpired(member)

  let daysBadgeText = ''
  let daysBadgeStyle = ''
  if (!member.expiryDate) {
    daysBadgeText = 'No expiry'
    daysBadgeStyle = 'bg-gray-100 text-gray-500'
  } else if (isExp) {
    daysBadgeText = `${Math.abs(days)}d expired`
    daysBadgeStyle = 'bg-red-100 text-red-600 font-bold'
  } else if (days === 0) {
    daysBadgeText = 'Expires today'
    daysBadgeStyle = 'bg-orange-100 text-orange-600 font-bold animate-pulse'
  } else if (days <= 3) {
    daysBadgeText = `${days}d left`
    daysBadgeStyle = 'bg-orange-100 text-orange-600 font-semibold'
  } else if (days <= 7) {
    daysBadgeText = `${days}d left`
    daysBadgeStyle = 'bg-amber-100 text-amber-700 font-semibold'
  } else if (days <= 15) {
    daysBadgeText = `${days}d left`
    daysBadgeStyle = 'bg-yellow-50 text-yellow-700 font-medium'
  } else {
    daysBadgeText = `${days}d left`
    daysBadgeStyle = 'bg-emerald-50 text-emerald-700 font-medium'
  }

  return (
    <div className="relative group">
      <Link
        to={`/members/${member.id}`}
        onClick={handleClick}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={handleContextMenu}
        className={`block bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100/80 transition-all select-none ${
          isPressing
            ? 'scale-[0.98] ring-2 ring-red-400 bg-red-50/30'
            : 'hover:shadow-md hover:border-gray-200'
        }`}
        style={{ WebkitTouchCallout: 'none' }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-base flex-shrink-0 shadow-inner">
            {member.name?.[0]?.toUpperCase() || '?'}
          </div>

          {/* Member Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-gray-900 truncate text-sm">{member.name}</p>
              {member.isVIP && (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded">
                  VIP
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-0.5">{member.dialCode} {member.phone}</p>

            {/* Prominent Date of Expiry row */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <Calendar size={13} className={isExp ? 'text-red-500' : 'text-accent'} />
                <span className="text-gray-500 font-medium text-[11px]">Expiry:</span>
                <span className={`text-[12px] font-bold ${isExp ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatExpiry(member.expiryDate) || '—'}
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${daysBadgeStyle}`}>
                {daysBadgeText}
              </span>
            </div>
          </div>

          {/* Right Badges & Due */}
          <div className="text-right space-y-1 flex-shrink-0">
            <BucketBadge member={member} />
            <PlanTypeBadge member={member} />
            <p className="text-[10px] text-gray-400 font-medium">{derivePlanLabel(member)}</p>
            {member.dueAmount > 0 && (
              <p className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                Due ₹{member.dueAmount}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Accessible delete button for desktop / click access */}
      <button
        type="button"
        title="Delete member"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onLongPress(member)
        }}
        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical size={14} />
      </button>
    </div>
  )
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
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full block ${cls}`}>{label}</span>
}

function PlanTypeBadge({ member }) {
  if (member.planType === 'trainer') {
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full block bg-purple-100 text-purple-600">Trainer</span>
  }
  if (member.planType === 'premiumTrainer') {
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full block bg-indigo-100 text-indigo-600">Premium Trainer</span>
  }
  return null
}
