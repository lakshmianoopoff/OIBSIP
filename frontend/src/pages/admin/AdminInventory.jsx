import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
    getInventory,
    restockIngredient,
    updateOrderStatus
} from '../../api/admin.api'
import {
    addIngredient,
    updateIngredient,
    deleteIngredient
} from '../../api/ingredient.api'

const TYPE_COLORS = {
    base: 'text-amber-700 bg-amber-50 border-amber-200',
    sauce: 'text-red-700 bg-red-50 border-red-200',
    cheese: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    veggie: 'text-green-700 bg-green-50 border-green-200',
    meat: 'text-rose-700 bg-rose-50 border-rose-200',
}

const TYPES = ['base', 'sauce', 'cheese', 'veggie', 'meat']

export default function AdminInventory() {
    const queryClient = useQueryClient()
    const [filterType, setFilterType] = useState('')
    const [restockId, setRestockId] = useState(null)
    const [restockQty, setRestockQty] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [newIngredient, setNewIngredient] = useState({
        name: '', type: 'base', price: '', quantity: '', thresholdValue: 20
    })

    const { data: inventory, isLoading } = useQuery({
        queryKey: ['admin-inventory'],
        queryFn: async () => {
            const res = await getInventory()
            return res.data.data
        },
    })

    const restockMutation = useMutation({
        mutationFn: ({ id, quantity }) => restockIngredient(id, quantity),
        onSuccess: () => {
            toast.success('Stock updated')
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
            setRestockId(null)
            setRestockQty('')
        },
        onError: () => toast.error('Failed to update stock'),
    })

    const addMutation = useMutation({
        mutationFn: addIngredient,
        onSuccess: () => {
            toast.success('Ingredient added')
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
            setShowAddForm(false)
            setNewIngredient({ name: '', type: 'base', price: '', quantity: '', thresholdValue: 20 })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add ingredient'),
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }) => updateIngredient(id, { isActive }),
        onSuccess: () => {
            toast.success('Ingredient updated')
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
        },
        onError: () => toast.error('Failed to update'),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteIngredient,
        onSuccess: () => {
            toast.success('Ingredient deleted')
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
        },
        onError: () => toast.error('Failed to delete'),
    })

    const filtered = inventory?.filter(i => filterType ? i.type === filterType : true) || []

    const lowStock = inventory?.filter(i => i.quantity <= i.thresholdValue && i.isActive) || []

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage ingredient stock
                        </p>
                    </div>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        + Add ingredient
                    </Button>
                </div>

                {/* Low stock alert */}
                {lowStock.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-amber-800 mb-1">
                            ⚠️ {lowStock.length} ingredient{lowStock.length > 1 ? 's' : ''} running low
                        </p>
                        <p className="text-xs text-amber-600">
                            {lowStock.map(i => i.name).join(', ')}
                        </p>
                    </div>
                )}

                {/* Add ingredient form */}
                {showAddForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                            Add new ingredient
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Name"
                                placeholder="e.g. Thin Crust"
                                value={newIngredient.name}
                                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={newIngredient.type}
                                    onChange={(e) => setNewIngredient({ ...newIngredient, type: e.target.value })}
                                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-200"
                                >
                                    {TYPES.map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Price (₹)"
                                type="number"
                                placeholder="0"
                                value={newIngredient.price}
                                onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })}
                            />
                            <Input
                                label="Initial quantity"
                                type="number"
                                placeholder="100"
                                value={newIngredient.quantity}
                                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                            />
                            <Input
                                label="Alert threshold"
                                type="number"
                                placeholder="20"
                                value={newIngredient.thresholdValue}
                                onChange={(e) => setNewIngredient({ ...newIngredient, thresholdValue: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button
                                onClick={() => addMutation.mutate({
                                    ...newIngredient,
                                    price: Number(newIngredient.price),
                                    quantity: Number(newIngredient.quantity),
                                    thresholdValue: Number(newIngredient.thresholdValue),
                                })}
                                loading={addMutation.isPending}
                            >
                                Add ingredient
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterType('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === '' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                    {TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filterType === type ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Inventory table */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-gray-400 text-sm">No ingredients found</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Ingredient
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Type
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Price
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Stock
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((item) => {
                                    const isLow = item.quantity <= item.thresholdValue
                                    const isRestocking = restockId === item._id

                                    return (
                                        <tr key={item._id} className={`hover:bg-gray-50 ${!item.isActive ? 'opacity-50' : ''}`}>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    Alert at {item.thresholdValue} {item.unit}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${TYPE_COLORS[item.type]}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-sm text-gray-700">₹{item.price}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {item.quantity}
                                                    </span>
                                                    {isLow && (
                                                        <span className="text-xs text-red-500">Low</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={() => toggleMutation.mutate({ id: item._id, isActive: !item.isActive })}
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.isActive
                                                            ? 'text-green-700 bg-green-50'
                                                            : 'text-gray-500 bg-gray-100'
                                                        }`}
                                                >
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    {isRestocking ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={restockQty}
                                                                onChange={(e) => setRestockQty(e.target.value)}
                                                                placeholder="Qty"
                                                                className="w-16 px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-red-200"
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => restockMutation.mutate({
                                                                    id: item._id,
                                                                    quantity: Number(restockQty)
                                                                })}
                                                                loading={restockMutation.isPending}
                                                            >
                                                                Add
                                                            </Button>
                                                            <button
                                                                onClick={() => { setRestockId(null); setRestockQty('') }}
                                                                className="text-xs text-gray-400 hover:text-gray-600"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setRestockId(item._id)}
                                                                className="text-xs text-blue-600 hover:underline"
                                                            >
                                                                Restock
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Delete ${item.name}?`)) {
                                                                        deleteMutation.mutate(item._id)
                                                                    }
                                                                }}
                                                                className="text-xs text-red-500 hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageLayout>
    )
}