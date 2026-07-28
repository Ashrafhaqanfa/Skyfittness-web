import { useNavigate } from 'react-router-dom'

export default function Tile({ title, value, Icon, color = 'bg-blue-100 text-blue-600', to }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => to && navigate(to)}
      className="bg-white rounded-2xl py-4 px-2 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={20} strokeWidth={2.25} />
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] text-gray-500 text-center leading-tight">{title}</div>
    </button>
  )
}
