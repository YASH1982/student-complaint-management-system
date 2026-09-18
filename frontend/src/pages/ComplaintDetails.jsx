import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

function ComplaintDetails() {
  const { id } = useParams()

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [attachments, setAttachments] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  const [comment, setComment] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  })

  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [attachmentLoading, setAttachmentLoading] = useState(false)
  const [attachmentsLoading, setAttachmentsLoading] = useState(true)
  const [previewLoading, setPreviewLoading] = useState(null)

  const [error, setError] = useState('')
  const [commentError, setCommentError] = useState('')
  const [commentSuccess, setCommentSuccess] = useState('')
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [attachmentError, setAttachmentError] = useState('')
  const [attachmentSuccess, setAttachmentSuccess] = useState('')

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        setError('')

        const [
          complaintResponse,
          historyResponse,
          attachmentsResponse,
        ] = await Promise.all([
          api.get(`/student/complaints/${id}`),
          api.get(`/student/complaints/${id}/history`),
          api.get(`/student/complaints/${id}/attachments`),
        ])

        setComplaint(complaintResponse.data)
        setHistory(historyResponse.data)
        setAttachments(attachmentsResponse.data)

        setEditForm({
          title: complaintResponse.data.title || '',
          description:
            complaintResponse.data.description || '',
          category:
            complaintResponse.data.category || '',
          priority:
            complaintResponse.data.priority || '',
        })
      } catch (error) {
        console.error(
          'Failed to fetch complaint details:',
          error
        )

        setError(
          error.userMessage ||
            error.response?.data?.error ||
            'Unable to load complaint details.'
        )
      } finally {
        setLoading(false)
        setAttachmentsLoading(false)
      }
    }

    fetchComplaintDetails()
  }, [id])

  const formatDate = (date) => {
    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  const formatFileSize = (size) => {
    if (!size || size < 1024) {
      return `${size || 0} B`
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    setAttachmentError('')
    setAttachmentSuccess('')
    setSelectedFile(file || null)
  }

  const handleAttachmentUpload = async (event) => {
    event.preventDefault()

    setAttachmentError('')
    setAttachmentSuccess('')

    if (!selectedFile) {
      setAttachmentError('Please select a file first.')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setAttachmentError(
        'File size cannot exceed 5 MB.'
      )
      return
    }

    setAttachmentLoading(true)

    try {
      const formData = new FormData()

      formData.append('file', selectedFile)

      const response = await api.post(
        `/student/complaints/${id}/attachments`,
        formData
      )

      setAttachments((currentAttachments) => [
        ...currentAttachments,
        response.data,
      ])

      setSelectedFile(null)

      const fileInput =
        document.getElementById('attachment-file')

      if (fileInput) {
        fileInput.value = ''
      }

      setAttachmentSuccess(
        'Attachment uploaded successfully.'
      )
    } catch (error) {
      console.error(
        'Failed to upload attachment:',
        error
      )

      setAttachmentError(
        error.userMessage ||
          error.response?.data?.error ||
          'Unable to upload attachment. Please try again.'
      )
    } finally {
      setAttachmentLoading(false)
    }
  }

  // Preview / open attachment
  const handleAttachmentPreview = async (
    attachmentId
  ) => {
    setAttachmentError('')
    setPreviewLoading(attachmentId)

    try {
      const response = await api.get(
        `/student/complaints/attachments/${attachmentId}/file`,
        {
          responseType: 'blob',
        }
      )

      const fileBlob = new Blob(
        [response.data],
        {
          type:
            response.headers['content-type'] ||
            'application/octet-stream',
        }
      )

      const fileUrl =
        window.URL.createObjectURL(fileBlob)

      window.open(fileUrl, '_blank')

      // Release the temporary browser URL later
      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl)
      }, 60000)
    } catch (error) {
      console.error(
        'Failed to preview attachment:',
        error
      )

      setAttachmentError(
        error.userMessage ||
          'Unable to preview attachment. Please try again.'
      )
    } finally {
      setPreviewLoading(null)
    }
  }

  const handleEditClick = () => {
    setEditError('')
    setEditSuccess('')

    setEditForm({
      title: complaint.title || '',
      description: complaint.description || '',
      category: complaint.category || '',
      priority: complaint.priority || '',
    })

    setEditMode(true)
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    setEditError('')
    setEditSuccess('')

    const title = editForm.title.trim()
    const description = editForm.description.trim()

    if (!title) {
      setEditError('Title is required.')
      return
    }

    if (title.length < 5) {
      setEditError(
        'Title must contain at least 5 characters.'
      )
      return
    }

    if (title.length > 200) {
      setEditError(
        'Title cannot exceed 200 characters.'
      )
      return
    }

    if (!description) {
      setEditError('Description is required.')
      return
    }

    if (description.length < 10) {
      setEditError(
        'Description must contain at least 10 characters.'
      )
      return
    }

    if (description.length > 5000) {
      setEditError(
        'Description cannot exceed 5000 characters.'
      )
      return
    }

    if (!editForm.category) {
      setEditError('Category is required.')
      return
    }

    if (!editForm.priority) {
      setEditError('Priority is required.')
      return
    }

    setEditLoading(true)

    try {
      const response = await api.put(
        `/student/complaints/${id}`,
        {
          title,
          description,
          category: editForm.category,
          priority: editForm.priority,
        }
      )

      setComplaint(response.data)
      setEditMode(false)

      setEditSuccess(
        'Complaint updated successfully.'
      )
    } catch (error) {
      console.error(
        'Failed to update complaint:',
        error
      )

      setEditError(
        error.userMessage ||
          error.response?.data?.error ||
          'Unable to update complaint. Please try again.'
      )
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancelComplaint = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this complaint? This action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    setError('')
    setCancelLoading(true)

    try {
      const response = await api.delete(
        `/student/complaints/${id}`
      )

      setComplaint(response.data)
      setEditMode(false)
      setEditSuccess('')
    } catch (error) {
      console.error(
        'Failed to cancel complaint:',
        error
      )

      setError(
        error.userMessage ||
          error.response?.data?.error ||
          'Unable to cancel complaint. Please try again.'
      )
    } finally {
      setCancelLoading(false)
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()

    setCommentError('')
    setCommentSuccess('')

    const trimmedComment = comment.trim()

    if (!trimmedComment) {
      setCommentError('Comment is required.')
      return
    }

    if (trimmedComment.length > 1000) {
      setCommentError(
        'Comment cannot exceed 1000 characters.'
      )
      return
    }

    setCommentLoading(true)

    try {
      const response = await api.post(
        `/student/complaints/${id}/comments`,
        {
          comment: trimmedComment,
        }
      )

      setHistory((currentHistory) => [
        ...currentHistory,
        response.data,
      ])

      setComment('')

      setCommentSuccess(
        'Comment added successfully.'
      )
    } catch (error) {
      console.error(
        'Failed to add comment:',
        error
      )

      setCommentError(
        error.userMessage ||
          error.response?.data?.error ||
          'Unable to add comment. Please try again.'
      )
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />

        <main className="dashboard-content">
          <div className="empty-state">
            Loading complaint details...
          </div>
        </main>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="dashboard-page">
        <Navbar />

        <main className="dashboard-content">
          <div className="error-message">
            {error || 'Complaint not found.'}
          </div>

          <div className="page-actions">
            <Link
              to="/student/complaints"
              className="secondary-button"
            >
              Back to My Complaints
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        <section className="dashboard-header">
          <p className="dashboard-label">
            Student Portal
          </p>

          <h1>Complaint Details</h1>

          <p>
            View the complete information and status
            history for your complaint.
          </p>
        </section>

        {editSuccess && (
          <div className="success-message">
            {editSuccess}
          </div>
        )}

        <section className="complaint-details-card">
          <div className="complaint-details-header">
            <div>
              <p className="detail-label">
                Tracking Number
              </p>

              <h2>
                {complaint.trackingNumber}
              </h2>
            </div>

            <span
              className={`status-badge status-${complaint.status.toLowerCase()}`}
            >
              {formatStatus(complaint.status)}
            </span>
          </div>

          <div className="complaint-details-divider" />

          {editMode ? (
            <form onSubmit={handleEditSubmit}>
              {editError && (
                <div className="error-message">
                  {editError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-title">
                  Title
                </label>

                <input
                  id="edit-title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleEditChange}
                  minLength={5}
                  maxLength={200}
                  disabled={editLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">
                  Description
                </label>

                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  disabled={editLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">
                  Category
                </label>

                <select
                  id="edit-category"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  disabled={editLoading}
                >
                  <option value="">
                    Select category
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

              <div className="form-group">
                <label htmlFor="edit-priority">
                  Priority
                </label>

                <select
                  id="edit-priority"
                  name="priority"
                  value={editForm.priority}
                  onChange={handleEditChange}
                  disabled={editLoading}
                >
                  <option value="">
                    Select priority
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

              <div className="complaint-form-actions">
                <button
                  type="submit"
                  disabled={editLoading}
                >
                  {editLoading
                    ? 'Saving Changes...'
                    : 'Save Changes'}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditMode(false)
                    setEditError('')
                  }}
                  disabled={editLoading}
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="complaint-details-grid">
                <div className="detail-item detail-full">
                  <span className="detail-label">
                    Title
                  </span>

                  <strong>
                    {complaint.title}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Category
                  </span>

                  <strong>
                    {formatStatus(complaint.category)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Priority
                  </span>

                  <span
                    className={`priority-badge priority-${complaint.priority.toLowerCase()}`}
                  >
                    {formatStatus(complaint.priority)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Department
                  </span>

                  <strong>
                    {complaint.departmentId ||
                      'Not assigned'}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Submitted
                  </span>

                  <strong>
                    {formatDate(
                      complaint.createdAt
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Last Updated
                  </span>

                  <strong>
                    {formatDate(
                      complaint.updatedAt
                    )}
                  </strong>
                </div>

                {complaint.resolvedAt && (
                  <div className="detail-item">
                    <span className="detail-label">
                      Resolved At
                    </span>

                    <strong>
                      {formatDate(
                        complaint.resolvedAt
                      )}
                    </strong>
                  </div>
                )}
              </div>

              <div className="complaint-description">
                <span className="detail-label">
                  Description
                </span>

                <p>
                  {complaint.description}
                </p>
              </div>

              {complaint.resolution && (
                <div className="complaint-resolution">
                  <span className="detail-label">
                    Resolution
                  </span>

                  <p>
                    {complaint.resolution}
                  </p>
                </div>
              )}

              {complaint.status === 'SUBMITTED' && (
                <div className="page-actions">
                  <button
                    type="button"
                    className="primary-link"
                    onClick={handleEditClick}
                  >
                    Edit Complaint
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancelComplaint}
                    disabled={cancelLoading}
                  >
                    {cancelLoading
                      ? 'Cancelling...'
                      : 'Cancel Complaint'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Attachments */}
        <section className="comment-card">
          <div className="comment-card-header">
            <p className="dashboard-label">
              Complaint Attachments
            </p>

            <h2>Attachments</h2>

            <p>
              Upload supporting files such as images or
              documents for your complaint.
            </p>
          </div>

          {attachmentError && (
            <div className="error-message">
              {attachmentError}
            </div>
          )}

          {attachmentSuccess && (
            <div className="success-message">
              {attachmentSuccess}
            </div>
          )}

          <form onSubmit={handleAttachmentUpload}>
            <div className="form-group">
              <label htmlFor="attachment-file">
                Select File
              </label>

              <input
                id="attachment-file"
                type="file"
                onChange={handleFileChange}
                disabled={attachmentLoading}
              />

              <small className="character-count">
                Maximum file size: 5 MB
              </small>
            </div>

            {selectedFile && (
              <div className="attachment-selected">
                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {formatFileSize(
                    selectedFile.size
                  )}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                attachmentLoading || !selectedFile
              }
            >
              {attachmentLoading
                ? 'Uploading...'
                : 'Upload Attachment'}
            </button>
          </form>

          <div className="complaint-details-divider" />

          {attachmentsLoading ? (
            <div className="history-empty">
              <p>Loading attachments...</p>
            </div>
          ) : attachments.length === 0 ? (
            <div className="history-empty">
              <p>
                No attachments have been uploaded yet.
              </p>
            </div>
          ) : (
            <div className="attachment-list">
              {attachments.map((attachment) => (
                <div
                  className="attachment-item"
                  key={attachment.id}
                >
                  <div>
                    <strong>
                      {attachment.fileName}
                    </strong>

                    <p>
                      {attachment.contentType}
                    </p>
                  </div>

                  <div>
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
                      className="primary-button"
                      onClick={() =>
                        handleAttachmentPreview(
                          attachment.id
                        )
                      }
                      disabled={
                        previewLoading ===
                        attachment.id
                      }
                    >
                      {previewLoading ===
                      attachment.id
                        ? 'Opening...'
                        : 'Preview'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Status History */}
        <section className="status-history-card">
          <div className="status-history-header">
            <div>
              <p className="dashboard-label">
                Complaint Tracking
              </p>

              <h2>Status History</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="history-empty">
              <p>
                No status updates have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="status-timeline">
              {history.map((item) => (
                <div
                  className="status-history-item"
                  key={item.id}
                >
                  <div className="timeline-marker" />

                  <div className="status-history-content">
                    <div className="status-history-top">
                      <strong>
                        {formatStatus(
                          item.newStatus
                        )}
                      </strong>

                      <span>
                        {formatDate(
                          item.changedAt
                        )}
                      </span>
                    </div>

                    <p className="status-transition">
                      {item.oldStatus
                        ? `${formatStatus(item.oldStatus)} → ${formatStatus(item.newStatus)}`
                        : formatStatus(
                            item.newStatus
                          )}
                    </p>

                    {item.changedBy && (
                      <p className="status-changed-by">
                        Updated by {item.changedBy}
                      </p>
                    )}

                    {item.comment && (
                      <div className="status-history-comment">
                        <span>Comment</span>

                        <p>
                          {item.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add Comment */}
        <section className="comment-card">
          <div className="comment-card-header">
            <p className="dashboard-label">
              Complaint Discussion
            </p>

            <h2>Add a Comment</h2>

            <p>
              Add additional information or follow-up
              details about your complaint.
            </p>
          </div>

          {commentError && (
            <div className="error-message">
              {commentError}
            </div>
          )}

          {commentSuccess && (
            <div className="success-message">
              {commentSuccess}
            </div>
          )}

          <form onSubmit={handleCommentSubmit}>
            <div className="form-group">
              <label htmlFor="comment">
                Comment
              </label>

              <textarea
                id="comment"
                name="comment"
                placeholder="Write your comment..."
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                maxLength={1000}
                rows={5}
                disabled={commentLoading}
              />

              <small className="character-count">
                {comment.length}/1000
              </small>
            </div>

            <button
              type="submit"
              disabled={commentLoading}
            >
              {commentLoading
                ? 'Adding Comment...'
                : 'Add Comment'}
            </button>
          </form>
        </section>

        <div className="page-actions">
          <Link
            to="/student/complaints"
            className="secondary-button"
          >
            Back to My Complaints
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ComplaintDetails