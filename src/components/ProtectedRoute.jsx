import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingScreen from './LoadingScreen.jsx'

export default function ProtectedRoute({ children }) {
  const { authReady, isLoggedIn } = useAuth()
  if (!authReady) return <LoadingScreen />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}
