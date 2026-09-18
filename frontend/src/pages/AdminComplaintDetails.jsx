import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import './AdminComplaintDetails.css'

function AdminComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [departments, setDepartments] = useState([])
  const [attachments, setAttachments] = useState([])

  const [loading, setLoading] = useState(true)
  const [attachmentLoading, setAttachmentLoading] = useState(true)

  const [error, setError] = useState('')
  const [attachmentError, setAttachmentError] = useState('')

  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [comment, setComment] = useState('')
  const [resolution, setResolution] = useState('')

  const [savingDepartment, setSavingDepartment] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const [attachmentUrls, setAttachmentUrls] = useState({})

  const getToken = () => localStorage.getItem('token')

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  })

  const fetchComplaintData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        complaintResponse,
        historyResponse,
        departmentsResponse,
      ] = await Promise.all([
        api.get(`/admin/complaints/${id}`, {
          headers: getHeaders(),
        }),
        api.get(`/admin/complaints/${id}/history`, {
          headers: getHeaders(),
        }),
        api.get('/admin/departments', {
          headers: getHeaders(),
        }),
      ])

      setComplaint(complaintResponse.data)
      setHistory(historyResponse.data)
      setDepartments(departmentsResponse.data)

      setSelectedDepartment(
        complaintResponse.data.departmentId
          ? String(complaintResponse.data.departmentId)
          : ''
      )

      setSelectedStatus(complaintResponse.data.status)
      setResolution(complaintResponse.data.resolution || '')
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to load complaint details.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchAttachments = async () => {
    try {
      setAttachmentLoading(true)
      setAttachmentError('')

      const response = await api.get(
        `/admin/complaints/${id}/attachments`,
        {
          headers: getHeaders(),
        }
      )

      setAttachments(response.data)
    } catch (err) {
      console.error(err)

      setAttachmentError(
        err.response?.data?.message ||
          'Failed to load attachments.'
      )
    } finally {
      setAttachmentLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaintData()
    fetchAttachments()
  }, [id])

  /*
   * Load attachment files through Axios so the JWT
   * Authorization header is included.
   */
  useEffect(() => {
    let cancelled = false
    const createdUrls = []

    const loadAttachmentFiles = async () => {
      if (attachments.length === 0) {
        setAttachmentUrls({})
        return
      }

      const urls = {}

      for (const attachment of attachments) {
        try {
          const response = await api.get(
            `/admin/complaints/attachments/${attachment.id}/file`,
            {
              headers: getHeaders(),
              responseType: 'blob',
            }
          )

          const blobUrl = URL.createObjectURL(
            response.data
          )

          urls[attachment.id] = blobUrl
          createdUrls.push(blobUrl)
        } catch (err) {
          console.error(
            `Failed to load attachment ${attachment.id}:`,
            err
          )
        }
      }

      if (!cancelled) {
        setAttachmentUrls(urls)
      }
    }

    loadAttachmentFiles()

    return () => {
      cancelled = true

      createdUrls.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [attachments])

  const handleDepartmentChange = async () => {
    if (!selectedDepartment) {
      setError('Please select a department.')
      return
    }

    try {
      setSavingDepartment(true)
      setError('')

      await api.put(
        `/admin/complaints/${id}/department`,
        {
          departmentId: Number(selectedDepartment),
        },
        {
          headers: getHeaders(),
        }
      )

      await fetchComplaintData()
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to assign department.'
      )
    } finally {
      setSavingDepartment(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      setError('Please select a status.')
      return
    }

    if (
      selectedStatus === 'RESOLVED' &&
      !resolution.trim()
    ) {
      setError(
        'Resolution is required when resolving a complaint.'
      )
      return
    }

    try {
      setSavingStatus(true)
      setError('')

      await api.put(
        `/admin/complaints/${id}/status`,
        {
          status: selectedStatus,
          resolution:
            selectedStatus === 'RESOLVED'
              ? resolution
              : null,
          comment: comment.trim() || null,
        },
        {
          headers: getHeaders(),
        }
      )

      setComment('')

      await fetchComplaintData()
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Failed to update complaint status.'
      )
    } finally {
      setSavingStatus(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleString()
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) {
      return '0 Bytes'
    }

    const units = [
      'Bytes',
      'KB',
      'MB',
      'GB',
    ]

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    )

    const size =
      bytes / Math.pow(1024, index)

    return `${size.toFixed(
      index === 0 ? 0 : 2
    )} ${units[index]}`
  }

  const isImage = (contentType) => {
    return contentType?.startsWith('image/')
  }

  const isPdf = (contentType) => {
    return contentType === 'application/pdf'
  }

  const openAttachment = async (attachment) => {
    try {
      let fileUrl = attachmentUrls[attachment.id]

      if (!fileUrl) {
        const response = await api.get(
          `/admin/complaints/attachments/${attachment.id}/file`,
          {
            headers: getHeaders(),
            responseType: 'blob',
          }
        )

        fileUrl = URL.createObjectURL(
          response.data
        )
      }

      window.open(
        fileUrl,
        '_blank',
        'noopener,noreferrer'
      )
    } catch (err) {
      console.error(err)

      setAttachmentError(
        'Failed to open attachment.'
      )
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="empty-state">
            Loading complaint details...
          </div>
        </div>
      </div>
    )
  }

  if (error && !complaint) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">

          <div className="error-message">
            {error}
          </div>

          <Link
            to="/admin/complaints"
            className="secondary-button"
          >
            Back to Complaints
          </Link>

        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        <div className="dashboard-header">

          <div>
            <p className="dashboard-label">
              Admin Panel
            </p>

            <h1>Complaint Details</h1>

            <p>
              Review complaint information, manage
              assignment, update status, and track
              complaint history.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate('/admin/complaints')
            }
          >
            Back to Complaints
          </button>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {complaint && (
          <>

            {/* Complaint Information */}
            <section className="complaint-details-card">

              <div className="comment-card-header">

                <p className="dashboard-label">
                  Complaint
                </p>

                <h2>{complaint.title}</h2>

                <p>
                  Tracking Number:{' '}
                  <strong>
                    {complaint.trackingNumber}
                  </strong>
                </p>

              </div>

              <div className="details-grid">

                <div>
                  <span>Status</span>
                  <strong>
                    {complaint.status}
                  </strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>
                    {complaint.category}
                  </strong>
                </div>

                <div>
                  <span>Priority</span>
                  <strong>
                    {complaint.priority || 'N/A'}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {complaint.departmentId
                      ? departments.find(
                          (department) =>
                            department.id ===
                            complaint.departmentId
                        )?.name || 'Assigned'
                      : 'Not Assigned'}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      complaint.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Updated</span>
                  <strong>
                    {formatDate(
                      complaint.updatedAt
                    )}
                  </strong>
                </div>

              </div>

              <div className="complaint-description">

                <p className="dashboard-label">
                  Description
                </p>

                <p>
                  {complaint.description}
                </p>

              </div>

              {complaint.resolution && (
                <div className="complaint-description">

                  <p className="dashboard-label">
                    Resolution
                  </p>

                  <p>
                    {complaint.resolution}
                  </p>

                </div>
              )}

              {complaint.resolvedAt && (
                <div className="complaint-description">

                  <p className="dashboard-label">
                    Resolved At
                  </p>

                  <p>
                    {formatDate(
                      complaint.resolvedAt
                    )}
                  </p>

                </div>
              )}

            </section>

            {/* Student Information */}
            <section className="complaint-details-card">

              <div className="comment-card-header">

                <p className="dashboard-label">
                  Student
                </p>

                <h2>Student Information</h2>

                <p>
                  Information about the student who
                  submitted this complaint.
                </p>

              </div>

              <div className="details-grid">

                <div>
                  <span>Name</span>
                  <strong>
                    {complaint.studentName ||
                      'N/A'}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {complaint.studentEmail ||
                      'N/A'}
                  </strong>
                </div>

              </div>

            </section>

            {/* Department Assignment */}
            <section className="complaint-details-card">

              <div className="comment-card-header">

                <p className="dashboard-label">
                  Assignment
                </p>

                <h2>
                  Department Assignment
                </h2>

                <p>
                  Assign this complaint to the
                  appropriate department.
                </p>

              </div>

              <div className="admin-action-row">

                <select
                  value={selectedDepartment}
                  onChange={(event) =>
                    setSelectedDepartment(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    )
                  )}

                </select>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleDepartmentChange
                  }
                  disabled={
                    savingDepartment
                  }
                >
                  {savingDepartment
                    ? 'Assigning...'
                    : 'Assign Department'}
                </button>

              </div>

            </section>

            {/* Status Management */}
            <section className="complaint-details-card">

              <div className="comment-card-header">

                <p className="dashboard-label">
                  Status Management
                </p>

                <h2>
                  Update Complaint Status
                </h2>

                <p>
                  Change the complaint status and
                  optionally add an administrative
                  comment.
                </p>

              </div>

              <div className="admin-form">

                <label>
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value
                    )
                  }
                >

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

                {selectedStatus ===
                  'RESOLVED' && (
                  <>
                    <label>
                      Resolution
                    </label>

                    <textarea
                      value={resolution}
                      onChange={(event) =>
                        setResolution(
                          event.target.value
                        )
                      }
                      placeholder="Enter the resolution provided to the student..."
                      rows="4"
                    />
                  </>
                )}

                <label>
                  Comment
                </label>

                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  placeholder="Add an administrative comment..."
                  rows="4"
                />

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleStatusChange
                  }
                  disabled={savingStatus}
                >
                  {savingStatus
                    ? 'Updating...'
                    : 'Update Status'}
                </button>

              </div>

            </section>

            {/* Attachments */}
            <section className="complaint-details-card">

              <div className="comment-card-header">

                <p className="dashboard-label">
                  Complaint Files
                </p>

                <h2>Attachments</h2>

                <p>
                  Files submitted by the student
                  with this complaint.
                </p>

              </div>

              {attachmentLoading ? (
                <div className="empty-state">
                  Loading attachments...
                </div>
              ) : attachmentError ? (
                <div className="error-message">
                  {attachmentError}
                </div>
              ) : attachments.length === 0 ? (
                <div className="history-empty">

                  <p>
                    No attachments have been
                    submitted for this complaint.
                  </p>

                </div>
              ) : (
                <div className="attachment-list">

                  {attachments.map(
                    (attachment) => {

                      const fileUrl =
                        attachmentUrls[
                          attachment.id
                        ]

                      return (
                        <div
                          className="attachment-item"
                          key={attachment.id}
                        >

                          <div className="attachment-file-info">

                            {isImage(
                              attachment.contentType
                            ) && fileUrl ? (

                              <img
                                src={fileUrl}
                                alt={
                                  attachment.fileName
                                }
                                className="attachment-preview"
                              />

                            ) : isImage(
                                attachment.contentType
                              ) ? (

                              <div className="attachment-icon">
                                IMG
                              </div>

                            ) : (

                              <div className="attachment-icon">
                                {isPdf(
                                  attachment.contentType
                                )
                                  ? 'PDF'
                                  : 'FILE'}
                              </div>

                            )}

                            <div>

                              <strong>
                                {attachment.fileName}
                              </strong>

                              <p>
                                {attachment.contentType ||
                                  'Unknown file type'}
                              </p>

                            </div>

                          </div>

                          <div className="attachment-meta">

                            <span>
                              {formatFileSize(
                                attachment.fileSize
                              )}
                            </span>

                            <small>
                              {formatDate(
                                attachment.uploadedAt
                              )}
                            </small>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                openAttachment(
                                  attachment
                                )
                              }
                            >
                              View File
                            </button>

                          </div>

                        </div>
                      )
                    }
                  )}

                </div>
              )}

            </section>

            {/* History */}
            <section className="complaint-details-card">

              <div className="comment-card-header">

                <p className="dashboard-label">
                  Activity
                </p>

                <h2>
                  Status History & Comments
                </h2>

                <p>
                  Track all administrative status
                  changes and comments.
                </p>

              </div>

              {history.length === 0 ? (
                <div className="history-empty">

                  <p>
                    No status history is available
                    yet.
                  </p>

                </div>
              ) : (
                <div className="history-list">

                  {history.map((item) => (

                    <div
                      className="history-item"
                      key={item.id}
                    >

                      <div className="history-item-header">

                        <strong>
                          {item.oldStatus}
                          {' → '}
                          {item.newStatus}
                        </strong>

                        <span>
                          {formatDate(
                            item.changedAt
                          )}
                        </span>

                      </div>

                      <p>
                        Changed by:{' '}
                        <strong>
                          {item.changedBy ||
                            'Admin'}
                        </strong>
                      </p>

                      {item.comment && (
                        <div className="history-comment">
                          {item.comment}
                        </div>
                      )}

                    </div>

                  ))}

                </div>
              )}

            </section>

          </>
        )}

      </div>
    </div>
  )
}

export default AdminComplaintDetails