import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import Spinner from '../../components/ui/Spinner'
import { getDashboardStats, getAllOrders } from '../../api/admin.api'

const StatCard = ({ label, value, icon, sub }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{label}</p>
            <span className="text-xl">{icon}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
)

const STATUS_CONFIG = {
    payment_pending: { label: 'Payment Pending', color: 'text-yellow-600 bg-yellow-50' },
    placed: { label: 'Order Placed', color: 'text-blue-600 bg-blue-50' },
    in_kitchen: { label: 'In Kitchen', color: 'text-orange-600 bg-orange-50' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50' },
}

export default function AdminDashboard() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await getDashboardStats()
            return res.data.data
        },
    })

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: async () => {
            const res = await getAllOrders()
            return res.data.data
        },
    })

    const recentOrders = orders?.slice(0, 5) || []

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of your pizza store</p>
                </div>

                {statsLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon="📦" />
                        <StatCard label="Total Revenue" value={`₹${stats?.totalRevenue ?? 0}`} icon="💰" />
                        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} icon="⏳" sub="Waiting to be processed" />
                        <StatCard label="Low Stock Items" value={stats?.lowStockCount ?? 0} icon="⚠️" sub={stats?.lowStockCount > 0 ? 'Needs restocking' : 'All good'} />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Link to="/admin/orders" className="bg-white border border-gray-200 rounded-xl p-6 hover:border-red-200 hover:bg-red-50 transition-all group">
                        <div className="text-3xl mb-3">📋</div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-red-700">Manage Orders</p>
                        <p className="text-xs text-gray-400 mt-0.5">Update order statuses</p>
                    </Link>
                    <Link to="/admin/inventory" className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all group">
                        <div className="text-3xl mb-3">🧀</div>
                        <p className="text-sm font-medium text-gray-900">Manage Inventory</p>
                        <p className="text-xs text-gray-400 mt-0.5">Track ingredient stock</p>
                    </Link>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">Recent orders</h2>
                        <Link to="/admin/orders" className="text-sm text-red-600 hover:underline">View all</Link>
                    </div>

                    {ordersLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : recentOrders.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                            <p className="text-gray-400 text-sm">No orders yet</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-50">
                            {recentOrders.map((order) => {
                                const config = STATUS_CONFIG[order.status]
                                return (
                                    <Link key={order._id} to="/admin/orders">
                                        <div className="px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {order.userId?.name} · {order.items.length} pizza{order.items.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-900">₹{order.totalAmount}</span>
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config?.color}`}>
                                                    {config?.label}
                                                </span>
                                            </div>
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