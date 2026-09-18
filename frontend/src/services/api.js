import axios from 'axios'
import { forceLogout } from '../context/AuthContext.jsx'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Centralized response error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (!error.response) {
      console.error('Network error:', error)

      error.userMessage =
        'Unable to connect to the server. Please make sure the backend is running.'
    } else {
      const status = error.response.status

      switch (status) {
        case 400:
          error.userMessage =
            error.response.data?.message ||
            'Invalid request. Please check your input.'
          break

        case 401:
          error.userMessage =
            error.response.data?.message ||
            'Your session is invalid or has expired.'

          // Automatically logout when JWT is invalid or expired
          forceLogout()

          // Redirect user to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }

          break

        case 403:
          error.userMessage =
            error.response.data?.message ||
            'You are not authorized to perform this action.'
          break

        case 404:
          error.userMessage =
            error.response.data?.message ||
            'The requested resource was not found.'
          break

        case 500:
          error.userMessage =
            'Something went wrong on the server. Please try again later.'
          break

        default:
          error.userMessage =
            error.response.data?.message ||
            'Something went wrong. Please try again.'
      }
    }

    return Promise.reject(error)
  }
)

export default api