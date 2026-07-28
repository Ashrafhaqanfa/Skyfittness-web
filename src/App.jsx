import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import MembersListPage from './pages/MembersListPage.jsx'
import AddEditMemberPage from './pages/AddEditMemberPage.jsx'
import MemberDetailPage from './pages/MemberDetailPage.jsx'
import RecordPaymentPage from './pages/RecordPaymentPage.jsx'
import PaymentsPage from './pages/PaymentsPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import EnquiriesPage from './pages/EnquiriesPage.jsx'
import AddEditEnquiryPage from './pages/AddEditEnquiryPage.jsx'
import DietPlansPage from './pages/DietPlansPage.jsx'
import ReferralsPage from './pages/ReferralsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ManageStaffPage from './pages/ManageStaffPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import MessageHistoryPage from './pages/MessageHistoryPage.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><MembersListPage /></ProtectedRoute>} />
        <Route path="/members/new" element={<ProtectedRoute><AddEditMemberPage /></ProtectedRoute>} />
        <Route path="/members/:id" element={<ProtectedRoute><MemberDetailPage /></ProtectedRoute>} />
        <Route path="/members/:id/edit" element={<ProtectedRoute><AddEditMemberPage /></ProtectedRoute>} />
        <Route path="/members/:id/record-payment" element={<ProtectedRoute><RecordPaymentPage /></ProtectedRoute>} />

        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />

        <Route path="/enquiries" element={<ProtectedRoute><EnquiriesPage /></ProtectedRoute>} />
        <Route path="/enquiries/new" element={<ProtectedRoute><AddEditEnquiryPage /></ProtectedRoute>} />
        <Route path="/enquiries/:id/edit" element={<ProtectedRoute><AddEditEnquiryPage /></ProtectedRoute>} />

        <Route path="/diet-plans" element={<ProtectedRoute><DietPlansPage /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/manage-staff" element={<ProtectedRoute><ManageStaffPage /></ProtectedRoute>} />
        <Route path="/more" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/sms-history" element={<ProtectedRoute><MessageHistoryPage /></ProtectedRoute>} />
        <Route path="/whatsapp-history" element={<ProtectedRoute><MessageHistoryPage /></ProtectedRoute>} />
        <Route path="/coming-soon" element={<ProtectedRoute><ComingSoonPage /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
