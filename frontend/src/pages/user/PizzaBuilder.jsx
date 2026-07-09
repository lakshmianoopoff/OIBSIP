import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'
import StepIndicator from '../../components/pizza/StepIndicator'
import IngredientCard from '../../components/pizza/IngredientCard'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { getAllIngredients } from '../../api/ingredient.api'
import { createRazorpayOrder, verifyPayment } from '../../api/order.api'

const INITIAL_SELECTION = {
    base: null,
    sauce: null,
    cheese: null,
    veggies: [],
}

export default function PizzaBuilder() {
    const [step, setStep] = useState(1)
    const [selection, setSelection] = useState(INITIAL_SELECTION)
    const [showCart, setShowCart] = useState(false)
    const { items, addItem, removeItem, clearCart, getTotalAmount } = useCartStore()
    const { user } = useAuthStore()

    const { data, isLoading } = useQuery({
        queryKey: ['ingredients'],
        queryFn: async () => {
            const res = await getAllIngredients()
            return res.data.data
        },
    })

    const paymentMutation = useMutation({
        mutationFn: createRazorpayOrder,
        onSuccess: (res) => {
            const { razorpayOrder, keyId, order } = res.data.data
            initiateRazorpayCheckout(razorpayOrder, keyId, order._id)
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to initiate payment')
        },
    })

    const verifyMutation = useMutation({
        mutationFn: verifyPayment,
        onSuccess: () => {
            toast.success('Order placed successfully! 🍕')
            clearCart()
            setSelection(INITIAL_SELECTION)
            setStep(1)
            setShowCart(false)
        },
        onError: () => {
            toast.error('Payment verification failed. Contact support.')
        },
    })

    const initiateRazorpayCheckout = (razorpayOrder, keyId, orderId) => {
        const options = {
            key: keyId,
            amount: razorpayOrder.amount,
            currency: 'INR',
            name: 'Pizza App',
            description: 'Custom Pizza Order',
            order_id: razorpayOrder.id,
            handler: (response) => {
                // Called when payment succeeds
                verifyMutation.mutate({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                })
            },
            prefill: {
                name: user?.name,
                email: user?.email,
            },
            theme: { color: '#c0392b' },
            modal: {
                ondismiss: () => toast('Payment cancelled', { icon: 'ℹ️' }),
            },
        }

        // Razorpay loaded via script tag in index.html
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const calculateItemPrice = (sel, ingredients) => {
        const basePrice = ingredients.base?.find(i => i.name === sel.base)?.price || 0
        const saucePrice = ingredients.sauce?.find(i => i.name === sel.sauce)?.price || 0
        const cheesePrice = ingredients.cheese?.find(i => i.name === sel.cheese)?.price || 0
        const veggiePrice = sel.veggies.reduce((sum, name) => {
            const v = ingredients.veggie?.find(i => i.name === name)
            return sum + (v?.price || 0)
        }, 0)
        return basePrice + saucePrice + cheesePrice + veggiePrice
    }

    const handleAddToCart = () => {
        if (!selection.base || !selection.sauce || !selection.cheese) {
            return toast.error('Please complete all required selections')
        }
        const itemPrice = calculateItemPrice(selection, data)
        addItem({ ...selection, quantity: 1, itemPrice })
        toast.success('Pizza added to cart!')
        setSelection(INITIAL_SELECTION)
        setStep(1)
    }

    const handleCheckout = () => {
        if (items.length === 0) return toast.error('Your cart is empty')
        paymentMutation.mutate(items)
    }

    const handleSingleSelect = (field) => (ingredient) => {
        setSelection((prev) => ({ ...prev, [field]: ingredient.name }))
    }

    const handleVeggieSelect = (ingredient) => {
        setSelection((prev) => ({
            ...prev,
            veggies: prev.veggies.includes(ingredient.name)
                ? prev.veggies.filter((v) => v !== ingredient.name)
                : [...prev.veggies, ingredient.name],
        }))
    }

    if (isLoading) return (
        <PageLayout>
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        </PageLayout>
    )

    const stepConfig = [
        { key: 'base', label: 'Choose your base', items: data?.base || [], multi: false },
        { key: 'sauce', label: 'Choose your sauce', items: data?.sauce || [], multi: false },
        { key: 'cheese', label: 'Choose your cheese', items: data?.cheese || [], multi: false },
        { key: 'veggies', label: 'Add your veggies', items: data?.veggie || [], multi: true },
    ]

    const currentStepConfig = stepConfig[step - 1]
    const canProceed = step === 4
        ? true  // veggies optional
        : !!selection[currentStepConfig?.key]

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Build your pizza</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Customize every layer</p>
                    </div>
                    <button
                        onClick={() => setShowCart(!showCart)}
                        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                    >
                        🛒 Cart
                        {items.length > 0 && (
                            <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {items.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Cart panel */}
                {showCart && (
                    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="font-medium text-gray-900 mb-4">Your cart</h3>
                        {items.length === 0 ? (
                            <p className="text-sm text-gray-400">No pizzas added yet</p>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Pizza #{index + 1}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {item.base} · {item.sauce} · {item.cheese}
                                                {item.veggies.length > 0 && ` · ${item.veggies.join(', ')}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">₹{item.itemPrice}</span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-semibold">Total</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        ₹{getTotalAmount()}
                                    </span>
                                </div>
                                <Button
                                    fullWidth
                                    onClick={handleCheckout}
                                    loading={paymentMutation.isPending || verifyMutation.isPending}
                                >
                                    Proceed to payment
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step indicator */}
                <StepIndicator currentStep={step} />

                {/* Builder steps 1-4 */}
                {step <= 4 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-1">
                            {currentStepConfig.label}
                        </h2>
                        {step === 4 && (
                            <p className="text-xs text-gray-400 mb-4">Optional — skip if you prefer</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                            {currentStepConfig.items.map((ingredient) => (
                                <IngredientCard
                                    key={ingredient._id}
                                    ingredient={ingredient}
                                    selected={currentStepConfig.multi ? selection.veggies : selection[currentStepConfig.key]}
                                    onSelect={currentStepConfig.multi ? handleVeggieSelect : handleSingleSelect(currentStepConfig.key)}
                                    multi={currentStepConfig.multi}
                                />
                            ))}
                        </div>

                        <div className="flex justify-between mt-6">
                            {step > 1 ? (
                                <Button variant="outline" onClick={() => setStep(step - 1)}>
                                    Back
                                </Button>
                            ) : <div />}

                            {step < 4 ? (
                                <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
                                    Next
                                </Button>
                            ) : (
                                <Button onClick={() => setStep(5)}>
                                    Review pizza
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5 — Review */}
                {step === 5 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Review your pizza</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Base', value: selection.base },
                                { label: 'Sauce', value: selection.sauce },
                                { label: 'Cheese', value: selection.cheese },
                                { label: 'Veggies', value: selection.veggies.length > 0 ? selection.veggies.join(', ') : 'None' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">{label}</span>
                                    <span className="text-sm font-medium text-gray-900">{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2">
                                <span className="text-sm font-semibold">Price</span>
                                <span className="text-sm font-semibold text-red-600">
                                    ₹{calculateItemPrice(selection, data)}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setStep(4)}>
                                Back
                            </Button>
                            <Button onClick={handleAddToCart}>
                                Add to cart
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    )
}