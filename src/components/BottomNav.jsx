import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Menu } from 'lucide-react'

const items = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/members', label: 'Members', Icon: Users },
  { to: '/payments', label: 'Payments', Icon: CreditCard },
  { to: '/more', label: 'More', Icon: Menu },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-[380px] sm:max-w-[480px] md:max-w-[640px] lg:max-w-[900px] mx-auto bg-white border-t border-gray-200 flex justify-around pt-2 z-30"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs px-3 py-1 rounded-lg ${
              isActive ? 'text-accent font-semibold' : 'text-gray-400'
            }`
          }
        >
          <item.Icon size={20} className="mb-1" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
