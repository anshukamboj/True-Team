import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, homeFor } from '../context/AuthContext'

export default function ProtectedRoute({ children, role, allowedRoles }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  // a saved user with an unknown role would cause an endless redirect,
  // so log them out instead
  const badUser = user && user.role !== 'hr' && user.role !== 'employee'

  useEffect(() => {
    if (badUser) logout()
  }, [badUser, logout])

  if (badUser) return null

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const allowed = allowedRoles || (role ? [role] : null)
  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  return children ? children : <Outlet />
}