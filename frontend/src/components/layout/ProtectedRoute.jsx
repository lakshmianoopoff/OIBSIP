import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

// Redirects to login if not authenticated
export const ProtectedRoute = ({ children }) => {
    const { user, accessToken } = useAuthStore()
    if (!user || !accessToken) return <Navigate to="/login" replace />
    return children
}

// Redirects to dashboard if not admin
export const AdminRoute = ({ children }) => {
    const { user, accessToken } = useAuthStore()
    if (!user || !accessToken) return <Navigate to="/login" replace />
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
    return children
}

// Redirects to dashboard if already logged in
export const PublicRoute = ({ children }) => {
    const { user, accessToken } = useAuthStore()
    if (user && accessToken) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
    }
    return children
}