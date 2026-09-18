import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardPath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/student/dashboard'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={dashboardPath}>
          Complaint Management System
        </Link>
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          {user?.name}
        </span>

        <span className="navbar-role">
          {user?.role}
        </span>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar