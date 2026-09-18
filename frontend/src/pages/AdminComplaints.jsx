import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

function AdminComplaints() {
  const [complaints, setComplaints] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')

  const pageSize = 5

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError('')

      const params = {
        page,
        size: pageSize,
        sort: `${sortField},${sortDirection}`,
      }

      if (statusFilter) {
        params.status = statusFilter
      }

      if (categoryFilter) {
        params.category = categoryFilter
      }

      if (priorityFilter) {
        params.priority = priorityFilter
      }

      if (departmentFilter) {
        params.departmentId = departmentFilter
      }

      if (search.trim()) {
        params.studentName = search.trim()
      }

      const response = await api.get(
        '/admin/complaints',
        { params }
      )

      setComplaints(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
      setTotalElements(response.data.totalElements || 0)
    } catch (error) {
      console.error(
        'Failed to fetch complaints:',
        error
      )

      setError(
        error.userMessage ||
        'Unable to load complaints.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [
    page,
    statusFilter,
    categoryFilter,
    priorityFilter,
    departmentFilter,
    sortField,
    sortDirection,
  ])

  const handleSearch = (event) => {
    event.preventDefault()

    setPage(0)
    fetchComplaints()
  }

  const handleReset = () => {
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
    setPriorityFilter('')
    setDepartmentFilter('')
    setSortField('createdAt')
    setSortDirection('desc')
    setPage(0)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'asc'
          ? 'desc'
          : 'asc'
      )
    } else {
      setSortField(field)
      setSortDirection('asc')
    }

    setPage(0)
  }

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return '↕'
    }

    return sortDirection === 'asc'
      ? '↑'
      : '↓'
  }

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
    if (!status) return 'Unknown'

    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  }

  const formatCategory = (category) => {
    if (!category) return 'Not Set'

    return category
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  }

  const formatPriority = (priority) => {
    if (!priority) return 'Not Set'

    return priority
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
  }

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

            <h1>All Complaints</h1>

            <p>
              Search, filter, sort, and manage
              complaints submitted by students.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="secondary-button"
          >
            Dashboard
          </Link>

        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Filters */}
        <section className="complaint-filters">

          <div className="filter-header">

            <div>
              <p className="dashboard-label">
                Complaint Management
              </p>

              <h2>Search & Filters</h2>
            </div>

            <span className="filter-result-count">
              {loading
                ? 'Loading...'
                : `${totalElements} complaint${
                    totalElements === 1
                      ? ''
                      : 's'
                  }`}
            </span>

          </div>

          <form onSubmit={handleSearch}>

            <div className="filter-grid">

              <div className="filter-group search-group">

                <label htmlFor="admin-search">
                  Search Student
                </label>

                <input
                  id="admin-search"
                  type="text"
                  placeholder="Name or email"
                  value={search}
                  autoComplete="off"
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="filter-group">

                <label htmlFor="admin-status">
                  Status
                </label>

                <select
                  id="admin-status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value
                    )
                    setPage(0)
                  }}
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

                <label htmlFor="admin-category">
                  Category
                </label>

                <select
                  id="admin-category"
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(
                      event.target.value
                    )
                    setPage(0)
                  }}
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

              <div className="filter-group">

                <label htmlFor="admin-priority">
                  Priority
                </label>

                <select
                  id="admin-priority"
                  value={priorityFilter}
                  onChange={(event) => {
                    setPriorityFilter(
                      event.target.value
                    )
                    setPage(0)
                  }}
                >
                  <option value="">
                    All Priorities
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>
                </select>

              </div>

              <div className="filter-group">

                <label htmlFor="admin-department">
                  Department ID
                </label>

                <input
                  id="admin-department"
                  type="number"
                  min="1"
                  placeholder="Department ID"
                  value={departmentFilter}
                  onChange={(event) => {
                    setDepartmentFilter(
                      event.target.value
                    )
                    setPage(0)
                  }}
                />

              </div>

            </div>

            <div className="filter-actions">

              <button
                type="submit"
                className="primary-button"
              >
                Search Complaints
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={handleReset}
              >
                Reset Filters
              </button>

            </div>

          </form>

        </section>

        {/* Complaints */}
        <section className="complaints-table-card">

          {loading ? (

            <div className="empty-state">
              Loading complaints...
            </div>

          ) : complaints.length === 0 ? (

            <div className="empty-state">

              <h2>No complaints found</h2>

              <p>
                Try changing your search or
                filters.
              </p>

            </div>

          ) : (

            <>

              <div className="table-summary">

                <span>
                  Showing{' '}
                  <strong>
                    {complaints.length}
                  </strong>{' '}
                  of{' '}
                  <strong>
                    {totalElements}
                  </strong>{' '}
                  complaints
                </span>

                <span>
                  Page {page + 1} of {totalPages}
                </span>

              </div>

              <div className="table-wrapper">

                <table className="complaints-table">

                  <thead>

                    <tr>

                      <th>
                        <button
                          type="button"
                          className="table-sort-button"
                          onClick={() =>
                            handleSort(
                              'trackingNumber'
                            )
                          }
                        >
                          Tracking Number{' '}
                          {getSortIcon(
                            'trackingNumber'
                          )}
                        </button>
                      </th>

                      <th>
                        <button
                          type="button"
                          className="table-sort-button"
                          onClick={() =>
                            handleSort('title')
                          }
                        >
                          Title{' '}
                          {getSortIcon('title')}
                        </button>
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
                        Department
                      </th>

                      <th>
                        <button
                          type="button"
                          className="table-sort-button"
                          onClick={() =>
                            handleSort(
                              'createdAt'
                            )
                          }
                        >
                          Submitted{' '}
                          {getSortIcon(
                            'createdAt'
                          )}
                        </button>
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {complaints.map(
                      (complaint) => (

                        <tr
                          key={complaint.id}
                        >

                          <td>

                            <Link
                              to={`/admin/complaints/${complaint.id}`}
                              className="complaint-link"
                            >
                              {
                                complaint.trackingNumber
                              }
                            </Link>

                          </td>

                          <td>

                            <span className="complaint-title">
                              {complaint.title}
                            </span>

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

                            {complaint.departmentId
                              ? `Department #${complaint.departmentId}`
                              : 'Unassigned'}

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

        {/* Pagination */}
        {!loading && totalPages > 0 && (

          <div className="pagination">

            <button
              type="button"
              className="secondary-button"
              disabled={page === 0}
              onClick={() =>
                setPage(page - 1)
              }
            >
              ← Previous
            </button>

            <span>
              Page <strong>{page + 1}</strong>{' '}
              of <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              className="secondary-button"
              disabled={
                page >= totalPages - 1
              }
              onClick={() =>
                setPage(page + 1)
              }
            >
              Next →
            </button>

          </div>

        )}

        {/* Bottom Navigation */}
        <div className="page-actions">

          <Link
            to="/admin/dashboard"
            className="secondary-button"
          >
            ← Back to Dashboard
          </Link>

        </div>

      </main>

    </div>
  )
}

export default AdminComplaints