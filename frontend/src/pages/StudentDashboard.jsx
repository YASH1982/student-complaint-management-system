import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

function StudentDashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setError('')

        const response = await api.get(
          '/student/complaints'
        )

        setComplaints(response.data || [])
      } catch (error) {
        console.error(
          'Failed to fetch complaints:',
          error
        )

        setError(
          error.userMessage ||
          'Unable to load complaint statistics.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const totalComplaints = complaints.length

  const submittedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === 'SUBMITTED'
  ).length

  const inProgressComplaints = complaints.filter(
    (complaint) =>
      complaint.status === 'ASSIGNED' ||
      complaint.status === 'IN_PROGRESS'
  ).length

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === 'RESOLVED' ||
      complaint.status === 'CLOSED'
  ).length

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">

        {/* Header */}
        <section className="dashboard-header">

          <div>
            <p className="dashboard-label">
              Student Portal
            </p>

            <h1>Student Dashboard</h1>

            <p>
              Manage your complaints and track
              their progress.
            </p>
          </div>

        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <span className="stat-label">
              Total Complaints
            </span>

            <strong>
              {loading
                ? '...'
                : totalComplaints}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Submitted
            </span>

            <strong>
              {loading
                ? '...'
                : submittedComplaints}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              In Progress
            </span>

            <strong>
              {loading
                ? '...'
                : inProgressComplaints}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              Resolved
            </span>

            <strong>
              {loading
                ? '...'
                : resolvedComplaints}
            </strong>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="dashboard-cards">

          {/* Submit Complaint */}
          <div className="dashboard-card">

            <h2>Submit Complaint</h2>

            <p>
              Report a new issue or concern to
              the administration.
            </p>

            <Link
              to="/student/complaints/new"
              className="primary-button"
            >
              Submit Complaint
            </Link>

          </div>

          {/* My Complaints */}
          <div className="dashboard-card">

            <h2>My Complaints</h2>

            <p>
              View your submitted complaints and
              their current status.
            </p>

            <Link
              to="/student/complaints"
              className="primary-button"
            >
              View Complaints
            </Link>

          </div>

          {/* Complaint History */}
          <div className="dashboard-card">

            <h2>Complaint History</h2>

            <p>
              Track complaint updates and status
              history.
            </p>

            <Link
              to="/student/complaints"
              className="primary-button"
            >
              View History
            </Link>

          </div>

        </section>

      </main>
    </div>
  )
}

export default StudentDashboard