import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--offwhite)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={36} color="var(--forest)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Loading FarmDirect...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (user.role === 'farmer') {
    return <FarmerDashboard />
  }

  // Default to buyer if missing role or explicitly buyer
  return <BuyerDashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
