import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useMembers, liveMembers, expiredMembers, demoMembers, membersInBucket, todaysBirthdays, todaysAnniversaries, totalDueAmount } from '../services/members.js'
import { usePayments, todaysCollection, totalCollection } from '../services/payments.js'
import { useEnquiries, todaysFollowUps } from '../services/enquiries.js'
import { useTodaysAttendance } from '../services/attendance.js'
import Tile from '../components/Tile.jsx'
import BottomNav from '../components/BottomNav.jsx'
import { Link } from 'react-router-dom'
import {
  LayoutGrid, LayoutList, MessageCircle, Phone, UserPlus, Dumbbell,
  UserCheck, Users, UserX, AlertTriangle, HelpCircle, Wallet,
  IndianRupee, Banknote, CreditCard, PieChart, BellRing, Cake,
  Heart, CalendarClock, MessageSquare, CalendarCheck, TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const { currentAdmin } = useAuth()
  const { members } = useMembers()
  const { payments } = usePayments()
  const { enquiries } = useEnquiries()
  const { todaysAttendance } = useTodaysAttendance()
  const [layout, setLayout] = useState('classic') // classic | sectionWise | insights
  const [bannerIndex, setBannerIndex] = useState(0)
  const banners = [Dumbbell, UserCheck, Dumbbell]

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dueReminderCount = members.filter((m) => {
    if (!m.dueAmountReminderDate) return false
    const t = new Date()
    return (
      m.dueAmountReminderDate.getFullYear() === t.getFullYear() &&
      m.dueAmountReminderDate.getMonth() === t.getMonth() &&
      m.dueAmountReminderDate.getDate() === t.getDate()
    )
  }).length

  const tiles = {
    members: [
      { title: 'Live Memberships', value: liveMembers(members).length, Icon: UserCheck, color: 'bg-green-100 text-green-600', to: '/members?filter=live' },
      { title: 'Total Memberships', value: members.length, Icon: Users, color: 'bg-blue-100 text-blue-600', to: '/members?filter=all' },
      { title: 'Expired Memberships', value: expiredMembers(members).length, Icon: UserX, color: 'bg-red-100 text-red-600', to: '/members?filter=expired' },
      { title: 'Expiring (1-3 Days)', value: membersInBucket(members, 'expiring1to3').length, Icon: AlertTriangle, color: 'bg-orange-100 text-orange-600', to: '/members?filter=expiring1to3' },
      { title: 'Expiring (4-7 Days)', value: membersInBucket(members, 'expiring4to7').length, Icon: AlertTriangle, color: 'bg-orange-100 text-orange-600', to: '/members?filter=expiring4to7' },
      { title: 'Expiring (8-15 Days)', value: membersInBucket(members, 'expiring8to15').length, Icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600', to: '/members?filter=expiring8to15' },
      { title: 'Demo Memberships', value: demoMembers(members).length, Icon: HelpCircle, color: 'bg-purple-100 text-purple-600', to: '/members?filter=demo' },
    ],
    financial: [
      { title: 'Due Amount', value: `₹${totalDueAmount(members).toFixed(0)}`, Icon: Wallet, color: 'bg-yellow-100 text-yellow-700', to: '/members?filter=due' },
      { title: 'Today Collection', value: `₹${todaysCollection(payments).toFixed(0)}`, Icon: IndianRupee, color: 'bg-green-100 text-green-600', to: '/payments' },
      { title: 'Total Collection', value: `₹${totalCollection(payments).toFixed(0)}`, Icon: Banknote, color: 'bg-teal-100 text-teal-600', to: '/payments' },
      { title: 'Total Expense', value: '₹0', Icon: CreditCard, color: 'bg-pink-100 text-pink-600', to: '/coming-soon' },
      { title: 'Balance Sheet', value: `₹${totalCollection(payments).toFixed(0)}`, Icon: PieChart, color: 'bg-indigo-100 text-indigo-600', to: '/reports' },
      { title: 'Due Amount Reminder', value: dueReminderCount, Icon: BellRing, color: 'bg-orange-100 text-orange-600', to: '/members?filter=dueReminder' },
    ],
    engagement: [
      { title: 'Birthday', value: todaysBirthdays(members).length, Icon: Cake, color: 'bg-pink-100 text-pink-600', to: '/members?filter=birthday' },
      { title: 'Anniversary', value: todaysAnniversaries(members).length, Icon: Heart, color: 'bg-red-100 text-red-600', to: '/members?filter=anniversary' },
      { title: 'Today Follow-ups', value: todaysFollowUps(enquiries).length, Icon: CalendarClock, color: 'bg-blue-100 text-blue-600', to: '/enquiries' },
      { title: 'Enquiries', value: enquiries.length, Icon: MessageSquare, color: 'bg-teal-100 text-teal-600', to: '/enquiries' },
      { title: 'Today Attendance', value: todaysAttendance.length, Icon: CalendarCheck, color: 'bg-cyan-100 text-cyan-600', to: '/attendance' },
    ],
  }

  const allTiles = [...tiles.members, ...tiles.financial, ...tiles.engagement]
  const BannerIcon = banners[bannerIndex]

  // ---- Insights data: the frequently-moving numbers, not just totals ----
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })
  const collectionByDay = last7Days.map((day) => {
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    const total = payments
      .filter((p) => p.paymentDate >= day && p.paymentDate < next)
      .reduce((sum, p) => sum + p.amount, 0)
    return { day, total }
  })
  const maxCollection = Math.max(1, ...collectionByDay.map((d) => d.total))

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const newMembersThisWeek = members.filter((m) => m.createdAt && m.createdAt >= weekAgo).length
  const attendanceTotalThisWeek = null // (today-only data is available client-side; see note below)

  const topDue = [...members]
    .filter((m) => (m.dueAmount || 0) > 0)
    .sort((a, b) => (b.dueAmount || 0) - (a.dueAmount || 0))
    .slice(0, 5)

  return (
    <div className="pb-4">
      <div
        className="bg-accent text-white px-4 pb-3 flex items-center justify-between"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <h1 className="text-lg font-semibold">Skyfitness</h1>
        <div className="flex items-center gap-4">
          <Link to="/members/new" title="Add Member"><UserPlus size={20} /></Link>
          <Link to="/sms-history" title="SMS History"><MessageCircle size={20} /></Link>
          <Link to="/whatsapp-history" title="WhatsApp History"><Phone size={20} /></Link>
        </div>
      </div>

      {/* Banner carousel */}
      <div className="mx-4 mt-3 h-40 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white/20 relative overflow-hidden">
        <BannerIcon size={72} strokeWidth={1.5} />
        <div className="absolute bottom-2 flex gap-1">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`w-1.5 h-1.5 rounded-full ${i === bannerIndex ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Layout toggle */}
      <div className="mx-4 mt-4 bg-gray-200 rounded-full p-1 flex text-sm font-semibold">
        <button
          onClick={() => setLayout('classic')}
          className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${layout === 'classic' ? 'bg-white text-accent' : 'text-gray-500'}`}
        >
          <LayoutGrid size={16} /> Classic
        </button>
        <button
          onClick={() => setLayout('sectionWise')}
          className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${layout === 'sectionWise' ? 'bg-white text-accent' : 'text-gray-500'}`}
        >
          <LayoutList size={16} /> Section wise
        </button>
        <button
          onClick={() => setLayout('insights')}
          className={`flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 ${layout === 'insights' ? 'bg-white text-accent' : 'text-gray-500'}`}
        >
          <TrendingUp size={16} /> Insights
        </button>
      </div>

      {layout === 'classic' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 px-4 mt-4">
          {allTiles.map((t) => (
            <Tile key={t.title} {...t} />
          ))}
        </div>
      )}

      {layout === 'sectionWise' && (
        <div className="mt-4 space-y-5">
          {Object.entries({ Members: tiles.members, Financial: tiles.financial, Engagement: tiles.engagement }).map(
            ([section, list]) => (
              <div key={section}>
                <h3 className="px-4 font-semibold text-gray-700 mb-2">{section}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 px-4">
                  {list.map((t) => (
                    <Tile key={t.title} {...t} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {layout === 'insights' && (
        <div className="mt-4 px-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Collection — Last 7 Days</p>
            <div className="flex items-end justify-between gap-2 h-28">
              {collectionByDay.map(({ day, total }) => (
                <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                    <div
                      className="w-full bg-accent rounded-t-md"
                      style={{ height: `${Math.max(4, (total / maxCollection) * 80)}px` }}
                      title={`₹${total.toFixed(0)}`}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400">New Members</p>
              <p className="text-xl font-bold">{newMembersThisWeek}</p>
              <p className="text-[10px] text-gray-400">last 7 days</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400">Today's Attendance</p>
              <p className="text-xl font-bold">{todaysAttendance.length}</p>
              <p className="text-[10px] text-gray-400">checked in today</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">Highest Due Amounts</p>
            {topDue.length === 0 ? (
              <p className="text-xs text-gray-400">No outstanding dues right now.</p>
            ) : (
              <div className="space-y-2">
                {topDue.map((m) => (
                  <Link key={m.id} to={`/members/${m.id}`} className="flex justify-between text-sm border-b border-gray-100 last:border-0 py-1.5">
                    <span>{m.name}</span>
                    <span className="text-red-500 font-semibold">₹{m.dueAmount}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
