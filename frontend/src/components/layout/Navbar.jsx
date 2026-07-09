import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import { logoutUser } from '../../api/auth.api'
import Button from '../ui/Button'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const itemCount = useCartStore((state) => state.getItemCount())

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      logout()
      navigate('/login')
      toast.success('Logged out')
    },
  })

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="text-red-600 font-bold text-lg">
          🍕 Pizza App
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {user?.role !== 'admin' && (
            <>
              <Link
                to="/build-pizza"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Build Pizza
              </Link>
              <Link
                to="/orders"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                My Orders
              </Link>
              <Link
                to="/build-pizza"
                className="relative text-sm text-gray-600 hover:text-gray-900"
              >
                🛒
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">
                Orders
              </Link>
              <Link to="/admin/inventory" className="text-sm text-gray-600 hover:text-gray-900">
                Inventory
              </Link>
            </>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <span className="text-sm text-gray-500">
              {user?.name?.split(' ')[0]}
            </span>
            <Button
              variant="outline"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}