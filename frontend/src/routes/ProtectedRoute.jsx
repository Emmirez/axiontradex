import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect admins away from user routes
  if (["admin", "superadmin"].includes(user.role)) {
    return <Navigate to="/admin" replace />
  }

  return children
}