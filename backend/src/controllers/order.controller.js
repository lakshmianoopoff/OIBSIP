const orderService = require('../services/order.service')
const { sendSuccess } = require('../utils/apiResponse')

const createRazorpayOrder = async (req, res, next) => {
    try {
        const data = await orderService.createRazorpayOrder(req.body.items, req.user._id)
        sendSuccess(res, 201, 'Razorpay order created', data)
    } catch (err) {
        next(err)
    }
}

const verifyPayment = async (req, res, next) => {
    try {
        const data = await orderService.verifyPaymentAndPlaceOrder(req.body)
        sendSuccess(res, 200, 'Payment verified, order placed', data)
    } catch (err) {
        next(err)
    }
}

const getUserOrders = async (req, res, next) => {
    try {
        const data = await orderService.getUserOrders(req.user._id)
        sendSuccess(res, 200, 'Orders fetched', data)
    } catch (err) {
        next(err)
    }
}

const getOrderById = async (req, res, next) => {
    try {
        const data = await orderService.getOrderById(req.params.id, req.user._id, req.user.role)
        sendSuccess(res, 200, 'Order fetched', data)
    } catch (err) {
        next(err)
    }
}

module.exports = { createRazorpayOrder, verifyPayment, getUserOrders, getOrderById }