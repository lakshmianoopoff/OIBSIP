import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { getAllOrders, updateOrderStatus } from '../../api/admin.api'

const STATUS_CONFIG = {
    payment_pending: { label: 'Payment Pending', color: 'text-yellow-600 bg-yellow-50' },
    placed: { label: 'Order Placed', color: 'text-blue-600 bg-blue-50' },
    in_kitchen: { label: 'In Kitchen', color: 'text-orange-600 bg-orange-50' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50' },
}

const NEXT_STATUS = {
    placed: 'in_kitchen',
    in_kitchen: 'out_for_delivery',
    out_for_delivery: 'delivered',
}

const NEXT_STATUS_LABEL = {
    placed: 'Move to Kitchen',
    in_kitchen: 'Mark Out for Delivery',
    out_for_delivery: 'Mark Delivered',
}

export default function AdminOrders() {
    const queryClient = useQueryClient()
    const [filterStatus, setFilterStatus] = useState('')
    const [expandedOrder, setExpandedOrder] = useState(null)

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders', filterStatus],
        queryFn: async () => {
            const res = await getAllOrders(filterStatus ? { status: filterStatus } : {})
            return res.data.data
        },
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateOrderStatus(id, status),
        onSuccess: (_, variables) => {
            toast.success('Order status updated')
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        },
        onError: () => toast.error('Failed to update status'),
    })

    const handleStatusUpdate = (orderId, newStatus) => {
        statusMutation.mutate({ id: orderId, status: newStatus })
    }

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {orders?.length ?? 0} orders found
                        </p>
                    </div>

                    {/* Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200"
                    >
                        <option value="">All statuses</option>
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                ) : !orders?.length ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-gray-400 text-sm">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const config = STATUS_CONFIG[order.status]
                            const nextStatus = NEXT_STATUS[order.status]
                            const isExpanded = expandedOrder === order._id

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                                >
                                    {/* Order row */}
                                    <div className="px-5 py-4 flex items-center justify-between">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config?.color}`}>
                                                    {config?.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {order.userId?.name} · {order.userId?.email} ·{' '}
                                                {order.items.length} pizza{order.items.length > 1 ? 's' : ''} ·{' '}
                                                ₹{order.totalAmount}
                                            </p>
                                        </div>

                                        {/* Status action button */}
                                        {nextStatus && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(order._id, nextStatus)}
                                                loading={statusMutation.isPending && statusMutation.variables?.id === order._id}
                                            >
                                                {NEXT_STATUS_LABEL[order.status]}
                                            </Button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <span className="text-xs text-green-600 font-medium px-3">
                                                ✓ Completed
                                            </span>
                                        )}
                                    </div>

                                    {/* Expanded order detail */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                Order Items
                                            </p>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-100">
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            Pizza #{index + 1} — ₹{item.itemPrice}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {[
                                                                { label: 'Base', value: item.base },
                                                                { label: 'Sauce', value: item.sauce },
                                                                { label: 'Cheese', value: item.cheese },
                                                                { label: 'Veggies', value: item.veggies?.join(', ') || 'None' },
                                                            ].map(({ label, value }) => (
                                                                <p key={label} className="text-xs text-gray-500">
                                                                    <span className="font-medium">{label}:</span> {value}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3">
                                                Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </PageLayout>
    )
}