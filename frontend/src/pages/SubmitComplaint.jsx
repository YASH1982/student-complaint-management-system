import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../services/api.js'

function SubmitComplaint() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const validateForm = () => {
    const title = formData.title.trim()
    const description = formData.description.trim()

    if (!title) {
      return 'Complaint title is required.'
    }

    if (title.length < 5) {
      return 'Complaint title must contain at least 5 characters.'
    }

    if (title.length > 200) {
      return 'Complaint title cannot exceed 200 characters.'
    }

    if (!formData.category) {
      return 'Please select a complaint category.'
    }

    if (!formData.priority) {
      return 'Please select a complaint priority.'
    }

    if (!description) {
      return 'Complaint description is required.'
    }

    if (description.length < 10) {
      return 'Complaint description must contain at least 10 characters.'
    }

    if (description.length > 5000) {
      return 'Complaint description cannot exceed 5000 characters.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      }

      const response = await api.post(
        '/student/complaints',
        complaintData
      )

      setSuccess(
        `Complaint submitted successfully. Tracking number: ${
          response.data.trackingNumber || response.data.id
        }`
      )

      setFormData({
        title: '',
        description: '',
        category: '',
        priority: '',
      })

      setTimeout(() => {
        navigate('/student/dashboard')
      }, 1500)
    } catch (error) {
      console.error(
        'Complaint submission failed:',
        error
      )

      setError(
        error.userMessage ||
        error.response?.data?.error ||
        'Unable to submit complaint. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        <section className="dashboard-header">
          <p className="dashboard-label">
            Student Portal
          </p>

          <h1>Submit Complaint</h1>

          <p>
            Provide the details of your complaint below.
          </p>
        </section>

        <section className="complaint-form-card">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                Complaint Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="Enter complaint title"
                value={formData.title}
                onChange={handleChange}
                minLength={5}
                maxLength={200}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
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
              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
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

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Describe your complaint in detail"
                value={formData.description}
                onChange={handleChange}
                minLength={10}
                maxLength={5000}
                rows={7}
                required
              />
            </div>

            <div className="complaint-form-actions">
              <Link
                to="/student/dashboard"
                className="secondary-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Submitting...'
                  : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default SubmitComplaint