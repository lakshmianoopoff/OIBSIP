const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order.controller')
const { protect } = require('../middlewares/auth.middleware')

router.post('/create-razorpay-order', protect, orderController.createRazorpayOrder)
router.post('/verify-payment', protect, orderController.verifyPayment)
router.get('/my-orders', protect, orderController.getUserOrders)
router.get('/:id', protect, orderController.getOrderById)

module.exports = router