const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    veggies: [{ type: String }],
    meat: [{ type: String }],
    quantity: { type: Number, default: 1, min: 1 },
    itemPrice: { type: Number, required: true },
    // Snapshot of ingredient prices at time of order
    // So historical orders never change even if admin edits prices later
    priceSnapshot: {
        base: Number,
        sauce: Number,
        cheese: Number,
        veggies: [{ name: String, price: Number }],
        meat: [{ name: String, price: Number }],
    },
})

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['payment_pending', 'placed', 'in_kitchen', 'out_for_delivery', 'delivered'],
            default: 'payment_pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        deliveryAddress: {
            street: String,
            city: String,
            pincode: String,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)