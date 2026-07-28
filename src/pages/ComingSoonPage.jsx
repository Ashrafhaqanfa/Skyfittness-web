import { useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'

export default function ComingSoonPage() {
  const { state } = useLocation()
  const title = state?.title || 'Coming soon'
  const Icon = state?.Icon || Sparkles
  const detail =
    state?.detail ||
    "This feature needs a bit more backend work before it's ready. Let's build it properly when you're ready to prioritize it."

  return (
    <div>
      <TopBar title={title} showBack />
      <div className="flex flex-col items-center justify-center text-center px-8 py-20">
        <div className="w-16 h-16 rounded-full bg-accent-light text-accent flex items-center justify-center mb-4">
          <Icon size={32} />
        </div>
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-500">{detail}</p>
      </div>
    </div>
  )
}
