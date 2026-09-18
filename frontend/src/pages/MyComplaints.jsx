import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
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
          error.response?.data?.error ||
          'Unable to load complaints. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const formatDate = (date) => {
    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const formatStatus = (status) => {
    if (!status) {
      return '-'
    }

    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  const formatCategory = (category) => {
    if (!category) {
      return '-'
    }

    return category
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  const formatPriority = (priority) => {
    if (!priority) {
      return '-'
    }

    return priority
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  const filteredComplaints = complaints.filter(
    (complaint) => {
      const searchText =
        search.toLowerCase().trim()

      const matchesSearch =
        !searchText ||
        complaint.trackingNumber
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.title
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.category
          ?.toLowerCase()
          .includes(searchText)

      const matchesStatus =
        !statusFilter ||
        complaint.status === statusFilter

      const matchesCategory =
        !categoryFilter ||
        complaint.category === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      )
    }
  )

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        <section className="dashboard-header">
          <p className="dashboard-label">
            Student Portal
          </p>

          <h1>My Complaints</h1>

          <p>
            View and track all complaints submitted by you.
          </p>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="complaint-filters">
          <div className="filter-group search-group">
            <label htmlFor="search">
              Search
            </label>

            <input
              id="search"
              type="text"
              placeholder="Search by tracking number, title or category"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoComplete="off"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">
                All Statuses
              </option>

              <option value="SUBMITTED">
                Submitted
              </option>

              <option value="ASSIGNED">
                Assigned
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="RESOLVED">
                Resolved
              </option>

              <option value="CLOSED">
                Closed
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="">
                All Categories
              </option>

              <option value="ACADEMIC">
                Academic
              </option>

              <option value="EXAMINATION">
                Examination
              </option>

              <option value="FINANCE">
                Finance
              </option>

              <option value="HOSTEL">
                Hostel
              </option>

              <option value="IT">
                IT
              </option>

              <option value="LIBRARY">
                Library
              </option>

              <option value="FACILITIES">
                Facilities
              </option>

              <option value="TRANSPORT">
                Transport
              </option>

              <option value="ADMINISTRATION">
                Administration
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>
        </section>

        <section className="complaints-table-card">
          {loading ? (
            <div className="empty-state">
              <h2>Loading complaints...</h2>

              <p>
                Please wait while we retrieve your complaints.
              </p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h2>Unable to load complaints</h2>

              <p>
                Please check your connection and try again.
              </p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <h2>
                {complaints.length === 0
                  ? 'No complaints yet'
                  : 'No complaints found'}
              </h2>

              <p>
                {complaints.length === 0
                  ? 'You have not submitted any complaints yet.'
                  : 'Try changing your search or filter.'}
              </p>

              {complaints.length === 0 && (
                <Link
                  to="/student/complaints/new"
                  className="primary-link"
                >
                  Submit Your First Complaint
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="table-summary">
                <span>
                  Showing{' '}
                  <strong>
                    {filteredComplaints.length}
                  </strong>{' '}
                  complaint
                  {filteredComplaints.length === 1
                    ? ''
                    : 's'}
                </span>
              </div>

              <div className="table-wrapper">
                <table className="complaints-table">
                  <thead>
                    <tr>
                      <th>
                        Tracking Number
                      </th>

                      <th>
                        Title
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Priority
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Submitted
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredComplaints.map(
                      (complaint) => (
                        <tr
                          key={complaint.id}
                        >
                          <td>
                            <Link
                              to={`/student/complaints/${complaint.id}`}
                              className="complaint-link"
                            >
                              {
                                complaint.trackingNumber
                              }
                            </Link>
                          </td>

                          <td>
                            {complaint.title}
                          </td>

                          <td>
                            {formatCategory(
                              complaint.category
                            )}
                          </td>

                          <td>
                            <span
                              className={`priority-badge priority-${
                                complaint.priority?.toLowerCase() ||
                                'unknown'
                              }`}
                            >
                              {formatPriority(
                                complaint.priority
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${
                                complaint.status?.toLowerCase() ||
                                'unknown'
                              }`}
                            >
                              {formatStatus(
                                complaint.status
                              )}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              complaint.createdAt
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="page-actions">
          <Link
            to="/student/dashboard"
            className="secondary-button"
          >
            Back to Dashboard
          </Link>

          <Link
            to="/student/complaints/new"
            className="primary-link"
          >
            Submit Complaint
          </Link>
        </div>
      </main>
    </div>
  )
}

export default MyComplaints