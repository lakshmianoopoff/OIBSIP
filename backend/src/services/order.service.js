const crypto = require('crypto')
const Order = require('../models/Order')
const IngredientOption = require('../models/IngredientOption')
const razorpay = require('../config/razorpay')
const { decreaseStock } = require('./ingredient.service')

// Step 1 — Create Razorpay order before payment
// Frontend calls this, gets back an orderId to open Razorpay checkout
const createRazorpayOrder = async (items, userId) => {
    // Validate all ingredients exist and are available
    for (const item of items) {
        const ingredientNames = [
            item.base, item.sauce, item.cheese,
            ...item.veggies, ...(item.meat || [])
        ]

        for (const name of ingredientNames) {
            const ingredient = await IngredientOption.findOne({ name, isActive: true })
            if (!ingredient) {
                const error = new Error(`Ingredient "${name}" is not available`)
                error.statusCode = 400
                throw error
            }
            if (ingredient.quantity <= 0) {
                const error = new Error(`"${name}" is out of stock`)
                error.statusCode = 400
                throw error
            }
        }
    }

    // Calculate total from DB prices — never trust frontend prices
    let totalAmount = 0
    const processedItems = []

    for (const item of items) {
        const [baseIng, sauceIng, cheeseIng] = await Promise.all([
            IngredientOption.findOne({ name: item.base, type: 'base' }),
            IngredientOption.findOne({ name: item.sauce, type: 'sauce' }),
            IngredientOption.findOne({ name: item.cheese, type: 'cheese' }),
        ])

        const veggieIngs = await IngredientOption.find({
            name: { $in: item.veggies }, type: 'veggie'
        })
        const meatIngs = item.meat?.length
            ? await IngredientOption.find({ name: { $in: item.meat }, type: 'meat' })
            : []

        const veggieTotal = veggieIngs.reduce((sum, v) => sum + v.price, 0)
        const meatTotal = meatIngs.reduce((sum, m) => sum + m.price, 0)
        const itemPrice = (
            baseIng.price + sauceIng.price + cheeseIng.price + veggieTotal + meatTotal
        ) * item.quantity

        totalAmount += itemPrice

        processedItems.push({
            ...item,
            itemPrice,
            priceSnapshot: {
                base: baseIng.price,
                sauce: sauceIng.price,
                cheese: cheeseIng.price,
                veggies: veggieIngs.map(v => ({ name: v.name, price: v.price })),
                meat: meatIngs.map(m => ({ name: m.name, price: m.price })),
            },
        })
    }

    // Create Razorpay order — amount must be in paise (multiply by 100)
    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    })

    // Save order in DB with payment_pending status
    const order = await Order.create({
        userId,
        items: processedItems,
        totalAmount,
        razorpayOrderId: razorpayOrder.id,
        status: 'payment_pending',
        paymentStatus: 'pending',
    })

    return {
        order,
        razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID,
    }
}

// Step 2 — Verify payment signature after Razorpay checkout completes
const verifyPaymentAndPlaceOrder = async ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    // Razorpay signature verification — this is how you confirm payment is genuine
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex')

    if (expectedSignature !== razorpaySignature) {
        const error = new Error('Payment verification failed')
        error.statusCode = 400
        throw error
    }

    // Update order status
    const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        {
            razorpayPaymentId,
            razorpaySignature,
            paymentStatus: 'paid',
            status: 'placed',
        },
        { new: true }
    )

    if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
    }

    // Decrease stock for all ingredients used
    await decreaseStock(order.items)

    return order
}

// Get user's orders
const getUserOrders = async (userId) => {
    return await Order.find({ userId }).sort({ createdAt: -1 })
}

// Get single order — with ownership check
const getOrderById = async (orderId, userId, userRole) => {
    const order = await Order.findById(orderId).populate('userId', 'name email')

    if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
    }

    // Users can only see their own orders — admins can see all
    if (userRole !== 'admin' && order.userId._id.toString() !== userId.toString()) {
        const error = new Error('Not authorized to view this order')
        error.statusCode = 403
        throw error
    }

    return order
}

module.exports = {
    createRazorpayOrder,
    verifyPaymentAndPlaceOrder,
    getUserOrders,
    getOrderById,
}