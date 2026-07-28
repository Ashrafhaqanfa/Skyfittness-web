import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import { useMembers } from '../services/members.js'
import { useTodaysAttendance, hasCheckedInToday, checkIn, undoCheckIn } from '../services/attendance.js'

export default function AttendancePage() {
  const { members } = useMembers()
  const { todaysAttendance } = useTodaysAttendance()
  const [search, setSearch] = useState('')

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <TopBar title="Attendance" showBack />
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-500">{todaysAttendance.length} checked in today</p>
        <input
          type="text" placeholder="Search members" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm"
        />
        <div className="space-y-2">
          {filtered.map((m) => {
            const checkedIn = hasCheckedInToday(todaysAttendance, m.id)
            return (
              <div key={m.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.phone}</p>
                </div>
                <button
                  onClick={() => (checkedIn ? undoCheckIn(todaysAttendance, m.id) : checkIn(m.id, todaysAttendance))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    checkedIn ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {checkedIn ? <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> Checked In</span> : 'Check In'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
