import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/BottomNav.jsx'
import {
  useMembers, isExpired, expiryBucket, isBirthdayToday, isAnniversaryToday,
} from '../services/members.js'
import { UserPlus, Users, UserCheck, UserX, HelpCircle, AlertTriangle, Wallet, BellRing, Cake, Heart } from 'lucide-react'

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
    default: return true
  }
}

export default function MembersListPage() {
  const { members, loading } = useMembers()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')

  // If the dashboard sends a new filter (e.g. tapping a different tile while
  // already on this page via back/forward), keep it in sync.
  useEffect(() => {
    const fromUrl = searchParams.get('filter')
    if (fromUrl && fromUrl !== filter) setFilter(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const filtered = members
    .filter((m) => matchesFilter(m, filter))
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search))

  const activeFilterLabel = filters.find((f) => f.key === filter)?.label || 'All'

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

      <div className="p-4 space-y-3">
        <input
          type="text"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                filter === f.key ? 'bg-accent text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <f.Icon size={14} /> {f.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{activeFilterLabel}</span> — {filtered.length} member(s)
        </p>

        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No members found for this filter.</p>
        )}

        <div className="space-y-2">
          {filtered.map((m) => (
            <Link
              key={m.id}
              to={`/members/${m.id}`}
              className="block bg-white rounded-xl p-3 shadow-sm flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold">
                {m.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{m.name}</p>
                <p className="text-xs text-gray-500">{m.phone}</p>
              </div>
              <div className="text-right">
                <BucketBadge member={m} />
                {m.dueAmount > 0 && <p className="text-xs text-red-500 mt-1">Due ₹{m.dueAmount}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
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
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}
