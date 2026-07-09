import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageLayout from '../../components/layout/PageLayout'
import Spinner from '../../components/ui/Spinner'
import useOrderSocket from '../../hooks/useOrderSocket'
import { getOrderById } from '../../api/order.api'

const STATUS_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: '✅', desc: 'Your order has been received' },
    { key: 'in_kitchen', label: 'In Kitchen', icon: '👨‍🍳', desc: 'Our chefs are making your pizza' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', desc: 'Your pizza is on the way' },
    { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your pizza!' },
]

const STATUS_ORDER = ['placed', 'in_kitchen', 'out_for_delivery', 'delivered']

export default function OrderDetail() {
    const { id } = useParams()

    const { data, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await getOrderById(id)
            return res.data.data
        },
    })

    // Real-time status from socket — falls back to DB status
    const { status, justUpdated } = useOrderSocket(id, data?.status)

    if (isLoading) return (
        <PageLayout>
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        </PageLayout>
    )

    if (!data) return (
        <PageLayout>
            <div className="text-center py-20">
                <p className="text-gray-400">Order not found</p>
                <Link to="/orders" className="text-red-600 text-sm mt-2 inline-block hover:underline">
                    Back to orders
                </Link>
            </div>
        </PageLayout>
    )

    const currentStatusIndex = STATUS_ORDER.indexOf(status)

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link to="/orders" className="text-sm text-gray-400 hover:text-gray-600">
                            ← Orders
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900 mt-1">
                            Order #{data._id.slice(-6).toUpperCase()}
                        </h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(data.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">₹{data.totalAmount}</p>
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                            {data.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                        </p>
                    </div>
                </div>

                {/* Live status update flash */}
                {justUpdated && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-green-700 font-medium">
                            🔔 Order status just updated!
                        </p>
                    </div>
                )}

                {/* Status tracker */}
                {status !== 'payment_pending' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-6">
                            Order status
                            <span className="ml-2 text-xs text-green-500 font-normal">● Live</span>
                        </h2>
                        <div className="space-y-0">
                            {STATUS_STEPS.map((step, index) => {
                                const isCompleted = currentStatusIndex > index
                                const isActive = currentStatusIndex === index
                                const isPending = currentStatusIndex < index

                                return (
                                    <div key={step.key} className="flex gap-4">
                                        {/* Timeline line + dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                        ${isCompleted ? 'bg-red-600 text-white'
                                                    : isActive ? 'bg-red-600 text-white ring-4 ring-red-100'
                                                        : 'bg-gray-100 text-gray-300'}
                      `}>
                                                {isCompleted ? '✓' : step.icon}
                                            </div>
                                            {index < STATUS_STEPS.length - 1 && (
                                                <div className={`w-0.5 h-8 mt-1 ${isCompleted ? 'bg-red-600' : 'bg-gray-100'
                                                    }`} />
                                            )}
                                        </div>

                                        {/* Label */}
                                        <div className="pb-8">
                                            <p className={`text-sm font-medium ${isActive ? 'text-red-600' : isPending ? 'text-gray-300' : 'text-gray-900'
                                                }`}>
                                                {step.label}
                                            </p>
                                            {isActive && (
                                                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Order items */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                        Items ({data.items.length})
                    </h2>
                    <div className="space-y-4">
                        {data.items.map((item, index) => (
                            <div key={index} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="flex justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        Pizza #{index + 1}
                                    </p>
                                    <p className="text-sm font-medium">₹{item.itemPrice}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {[
                                        { label: 'Base', value: item.base },
                                        { label: 'Sauce', value: item.sauce },
                                        { label: 'Cheese', value: item.cheese },
                                        { label: 'Veggies', value: item.veggies?.join(', ') || 'None' },
                                    ].map(({ label, value }) => (
                                        <p key={label} className="text-xs text-gray-400">
                                            <span className="text-gray-500">{label}:</span> {value}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-semibold text-red-600">₹{data.totalAmount}</span>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}