import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import Spinner from '../../components/ui/Spinner'
import { getMyOrders } from '../../api/order.api'

const STATUS_CONFIG = {
    payment_pending: { label: 'Payment Pending', color: 'text-yellow-600 bg-yellow-50', icon: '⏳' },
    placed: { label: 'Order Placed', color: 'text-blue-600 bg-blue-50', icon: '✅' },
    in_kitchen: { label: 'In Kitchen', color: 'text-orange-600 bg-orange-50', icon: '👨‍🍳' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50', icon: '🛵' },
    delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: '🎉' },
}

export default function OrderHistory() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const res = await getMyOrders()
            return res.data.data
        },
    })

    return (
        <PageLayout>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My orders</h1>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                ) : !data?.length ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-4xl mb-3">🍕</p>
                        <p className="text-gray-500 text-sm">No orders yet</p>
                        <Link
                            to="/build-pizza"
                            className="inline-block mt-4 px-5 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                            Build your first pizza
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.map((order) => {
                            const config = STATUS_CONFIG[order.status]
                            return (
                                <Link key={order._id} to={`/orders/${order._id}`}>
                                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Order #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {order.items.length} pizza{order.items.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config?.color}`}>
                                                    {config?.icon} {config?.label}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₹{order.totalAmount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </PageLayout>
    )
}