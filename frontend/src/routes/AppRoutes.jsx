import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import StudentDashboard from '../pages/StudentDashboard.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
import SubmitComplaint from '../pages/SubmitComplaint.jsx'
import MyComplaints from '../pages/MyComplaints.jsx'
import ComplaintDetails from '../pages/ComplaintDetails.jsx'
import AdminComplaints from '../pages/AdminComplaints.jsx'
import AdminComplaintDetails from '../pages/AdminComplaintDetails.jsx'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints/new"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
  path="/admin/complaints"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminComplaints />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/complaints/:id"
  element={
    <ProtectedRoute allowedRole="ADMIN">
      <AdminComplaintDetails />
    </ProtectedRoute>
  }
/>

        <Route
  path="/student/complaints"
  element={
    <ProtectedRoute allowedRole="STUDENT">
      <MyComplaints />
    </ProtectedRoute>
  }
/>


      <Route
  path="/student/complaints/:id"
  element={
    <ProtectedRoute allowedRole="STUDENT">
      <ComplaintDetails />
    </ProtectedRoute>
  }
/>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes