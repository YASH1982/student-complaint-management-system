import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user } = useAuth()

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User is logged in but user data is missing
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role-based protection
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    }

    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />
    }

    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute