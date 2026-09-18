import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

function AdminDashboard() {
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setError('')

        const response = await api.get(
          '/admin/complaints/statistics'
        )

        setStatistics(response.data)
      } catch (error) {
        console.error(
          'Failed to fetch admin statistics:',
          error
        )

        setError(
          error.userMessage ||
          'Unable to load dashboard statistics.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  const statCards = [
    {
      label: 'Total Complaints',
      value: statistics?.total,
    },
    {
      label: 'Submitted',
      value: statistics?.submitted,
    },
    {
      label: 'Assigned',
      value: statistics?.assigned,
    },
    {
      label: 'In Progress',
      value: statistics?.inProgress,
    },
    {
      label: 'Resolved',
      value: statistics?.resolved,
    },
    {
      label: 'Closed',
      value: statistics?.closed,
    },
    {
      label: 'Rejected',
      value: statistics?.rejected,
    },
    {
      label: 'Cancelled',
      value: statistics?.cancelled,
    },
  ]

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">

        {/* Header */}
        <section className="dashboard-header">

          <div>
            <p className="dashboard-label">
              Administration Portal
            </p>

            <h1>Admin Dashboard</h1>

            <p>
              Manage student complaints, monitor
              complaint activity, and track resolution
              progress from one place.
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="primary-link"
          >
            Manage Complaints
          </Link>

        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="dashboard-stats">

          {statCards.map((stat) => (
            <div
              className="stat-card"
              key={stat.label}
            >

              <span className="stat-label">
                {stat.label}
              </span>

              <strong>
                {loading
                  ? '...'
                  : stat.value ?? 0}
              </strong>

            </div>
          ))}

        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <p className="dashboard-label">
                Administration
              </p>

              <h2>Quick Actions</h2>

              <p>
                Access the main complaint management
                tools.
              </p>
            </div>

          </div>

          <div className="dashboard-cards">

            <div className="dashboard-card">

              <h2>All Complaints</h2>

              <p>
                View all complaints submitted by
                students, search records, and apply
                filters.
              </p>

              <Link
                to="/admin/complaints"
                className="primary-button"
              >
                View Complaints
              </Link>

            </div>

            <div className="dashboard-card">

              <h2>Complaint Management</h2>

              <p>
                Assign departments, update statuses,
                add comments, and resolve complaints.
              </p>

              <Link
                to="/admin/complaints"
                className="primary-button"
              >
                Manage Complaints
              </Link>

            </div>

            <div className="dashboard-card">

              <h2>System Overview</h2>

              <p>
                Monitor submitted, assigned,
                in-progress, resolved, and closed
                complaints.
              </p>

              <div className="overview-count">

                <strong>
                  {loading
                    ? '...'
                    : statistics?.total ?? 0}
                </strong>

                <span>
                  Total complaints
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  )
}

export default AdminDashboard