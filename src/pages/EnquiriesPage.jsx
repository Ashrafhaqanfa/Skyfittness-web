import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { useEnquiries, deleteEnquiry } from '../services/enquiries.js'
import { Plus, Inbox } from 'lucide-react'

const statusColor = {
  new: 'bg-blue-100 text-blue-600',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-600',
  lost: 'bg-red-100 text-red-600',
}

export default function EnquiriesPage() {
  const { enquiries, loading } = useEnquiries()

  return (
    <div>
      <TopBar
        title="Enquiries"
        showBack
        right={<Link to="/enquiries/new"><Plus size={20} /></Link>}
      />
      <div className="p-4 space-y-2">
        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}
        {!loading && enquiries.length === 0 && (
          <div className="text-center py-10">
            <Inbox size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold">No enquiries yet</p>
            <p className="text-sm text-gray-400">Tap + to add a new lead.</p>
          </div>
        )}
        {enquiries.map((e) => (
          <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-gray-400">{e.phone}</p>
                {e.interestCategory && <p className="text-xs text-gray-400">Interested in: {e.interestCategory}</p>}
                {e.followUpDate && (
                  <p className="text-xs text-gray-400">Follow-up: {e.followUpDate.toLocaleDateString()}</p>
                )}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusColor[e.status] || statusColor.new}`}>
                {e.status}
              </span>
            </div>
            <div className="flex gap-3 mt-2 text-xs">
              <Link to={`/enquiries/${e.id}/edit`} className="text-accent font-semibold">Edit</Link>
              <button onClick={() => deleteEnquiry(e.id)} className="text-red-500 font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
