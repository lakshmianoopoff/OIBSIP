import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import Spinner from '../../components/ui/Spinner'
import useAuthStore from '../../store/authStore'
import { getMyOrders } from '../../api/order.api'

const STATUS_CONFIG = {
    payment_pending: { label: 'Payment Pending', color: 'text-yellow-600 bg-yellow-50', icon: '⏳' },
    placed: { label: 'Order Placed', color: 'text-blue-600 bg-blue-50', icon: '✅' },
    in_kitchen: { label: 'In Kitchen', color: 'text-orange-600 bg-orange-50', icon: '👨‍🍳' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50', icon: '🛵' },
    delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: '🎉' },
}

export default function Dashboard() {
    const { user } = useAuthStore()

    const { data, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const res = await getMyOrders()
            return res.data.data
        },
    })

    const recentOrders = data?.slice(0, 3) || []
    const activeOrder = data?.find(o =>
        ['placed', 'in_kitchen', 'out_for_delivery'].includes(o.status)
    )

    return (
        <PageLayout>
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Hey, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        What are you having today?
                    </p>
                </div>

                {/* Active order banner */}
                {activeOrder && (
                    <Link to={`/orders/${activeOrder._id}`}>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5 hover:bg-red-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700">
                                        You have an active order
                                    </p>
                                    <p className="text-xs text-red-500 mt-0.5">
                                        {STATUS_CONFIG[activeOrder.status]?.icon}{' '}
                                        {STATUS_CONFIG[activeOrder.status]?.label}
                                    </p>
                                </div>
                                <span className="text-red-400 text-sm">Track →</span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        to="/build-pizza"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-red-200 hover:bg-red-50 transition-all group"
                    >
                        <div className="text-3xl mb-3">🍕</div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-red-700">
                            Build a pizza
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Customize your order
                        </p>
                    </Link>
                    <Link
                        to="/orders"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all group"
                    >
                        <div className="text-3xl mb-3">📦</div>
                        <p className="text-sm font-medium text-gray-900">
                            My orders
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            View order history
                        </p>
                    </Link>
                </div>

                {/* Recent orders */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">Recent orders</h2>
                        <Link to="/orders" className="text-sm text-red-600 hover:underline">
                            View all
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : recentOrders.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                            <p className="text-gray-400 text-sm">No orders yet</p>
                            <Link
                                to="/build-pizza"
                                className="inline-block mt-3 text-sm text-red-600 hover:underline"
                            >
                                Place your first order →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => {
                                const config = STATUS_CONFIG[order.status]
                                return (
                                    <Link key={order._id} to={`/orders/${order._id}`}>
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Order #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {order.items.length} pizza{order.items.length > 1 ? 's' : ''} ·{' '}
                                                    ₹{order.totalAmount}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config?.color}`}>
                                                {config?.icon} {config?.label}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    )
}