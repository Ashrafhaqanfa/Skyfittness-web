import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TopBar({ title, showBack = false, right = null }) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-20 bg-accent text-white px-4 py-3 flex items-center gap-3 shadow-sm">
      {showBack && (
        <button onClick={() => navigate(-1)} className="px-1">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="text-lg font-semibold flex-1 truncate">{title}</h1>
      {right}
    </div>
  )
}
