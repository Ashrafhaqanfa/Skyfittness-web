import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCategoriesAndPlans, seedSampleDataIfNeeded } from '../services/categoryPlans.js'
import BottomNav from '../components/BottomNav.jsx'
import {
  Sparkles, FileText, CheckCircle2, Inbox, CreditCard, MessageSquare,
  KeyRound, UtensilsCrossed, PersonStanding, Ruler, BarChart3, QrCode,
  HelpCircle, Link2, MessagesSquare, Phone,
} from 'lucide-react'

function ComingSoonLink({ to = '/coming-soon', title, Icon, children }) {
  return (
    <Link to={to} state={{ title, Icon }} className="block">
      {children}
    </Link>
  )
}

export default function SettingsPage() {
  const { currentAdmin, signOut } = useAuth()
  const { categories } = useCategoriesAndPlans()
  const navigate = useNavigate()
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    setSeeding(true)
    await seedSampleDataIfNeeded(categories)
    setSeeding(false)
  }

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  return (
    <div className="pb-4">
      <div
  className="bg-accent text-white px-4 pb-3"
  style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
>
  <h1 className="text-lg font-semibold">More</h1>
</div>

      {currentAdmin && (
        <div className="p-4 flex items-center gap-3 bg-white mb-2">
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xl">
            {currentAdmin.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold">{currentAdmin.name} ({currentAdmin.role})</p>
            <p className="text-xs text-gray-400">
              {currentAdmin.loginEmail} ({currentAdmin.role === 'owner' ? 'Super Admin' : currentAdmin.role})
            </p>
          </div>
        </div>
      )}

      <MenuSection title="Quick Actions">
        <Link to="/ai-assistant">
          <MenuRow Icon={Sparkles} title="AI Assistant" subtitle="Your personal AI tool" badge="New" />
        </Link>
        <ComingSoonLink title="Subscription" Icon={FileText}>
          <MenuRow Icon={FileText} title="Subscription" subtitle="Subscription Plans & Payments" />
        </ComingSoonLink>
      </MenuSection>

      <MenuSection title="Operations">
        <Link to="/attendance"><MenuRow Icon={CheckCircle2} title="Attendance" subtitle="Track member attendance" /></Link>
        <Link to="/enquiries"><MenuRow Icon={Inbox} title="Enquiry" subtitle="Track customer enquiries" /></Link>
        <ComingSoonLink title="Manage Expense" Icon={CreditCard}>
          <MenuRow Icon={CreditCard} title="Manage Expense" subtitle="Track business expenses" />
        </ComingSoonLink>
        <ComingSoonLink title="SMS" Icon={MessageSquare}>
          <MenuRow Icon={MessageSquare} title="SMS" subtitle="Send quick messages" />
        </ComingSoonLink>
      </MenuSection>

      {currentAdmin?.role === 'owner' && (
        <MenuSection title="Admin">
          <Link to="/manage-staff"><MenuRow Icon={KeyRound} title="Manage Trainer/Staff" subtitle="Add, edit users" /></Link>
        </MenuSection>
      )}

      <MenuSection title="Engagement">
        <Link to="/diet-plans"><MenuRow Icon={UtensilsCrossed} title="Diet Adv." subtitle="Advanced diet plans" /></Link>
        <ComingSoonLink title="Exercise Adv." Icon={PersonStanding}>
          <MenuRow Icon={PersonStanding} title="Exercise Adv." subtitle="Workouts from exercises library" />
        </ComingSoonLink>
        <ComingSoonLink title="Measurement Adv." Icon={Ruler}>
          <MenuRow Icon={Ruler} title="Measurement Adv." subtitle="Track body metrics" />
        </ComingSoonLink>
      </MenuSection>

      <MenuSection title="Reports & Settings">
        <Link to="/reports"><MenuRow Icon={BarChart3} title="Report" subtitle="View performance reports" /></Link>
        <Link to="/generate-qr">
          <MenuRow Icon={QrCode} title="Generate QR Code" subtitle="Quick access check-in" />
        </Link>
      </MenuSection>

      <MenuSection title="More">
        <ComingSoonLink title="Need Help?" Icon={HelpCircle}>
          <MenuRow Icon={HelpCircle} title="Need Help?" subtitle="FAQs and Videos" />
        </ComingSoonLink>
        <Link to="/referrals"><MenuRow Icon={Link2} title="Refer & Earn" subtitle="Refer Friends • Earn Coins" /></Link>
        <ComingSoonLink title="Communication" Icon={MessagesSquare}>
          <MenuRow Icon={MessagesSquare} title="Communication" subtitle="Connect us" />
        </ComingSoonLink>
        <ComingSoonLink title="Contact us" Icon={Phone}>
          <MenuRow Icon={Phone} title="Contact us" subtitle="Report your query/issue" />
        </ComingSoonLink>
      </MenuSection>

      <div className="bg-white mt-2 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase">Setup</p>
        <button
          onClick={handleSeed}
          disabled={categories.length > 0 || seeding}
          className="w-full text-left text-sm text-accent font-semibold disabled:text-gray-300"
        >
          {seeding ? 'Loading…' : 'Load sample categories & plans'}
        </button>
        <p className="text-xs text-gray-400">
          Use this once on a fresh Firebase project to populate example categories (Exercise, Yoga, Weight Loss) and
          plans, so the Add Member form isn't empty.
        </p>
      </div>

      <div className="bg-white mt-2 p-4">
        <button onClick={handleLogout} className="w-full text-red-500 font-semibold text-sm text-left">
          Logout
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

function MenuSection({ title, children }) {
  return (
    <div className="mt-2">
      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">{title}</p>
      <div className="bg-white divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function MenuRow({ Icon, title, subtitle, badge }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-lg bg-accent-light text-accent flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          {badge && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
  )
}
