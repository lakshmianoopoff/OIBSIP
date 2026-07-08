import api from './axios'

export const createRazorpayOrder = (items) => api.post('/orders/create-razorpay-order', { items })
export const verifyPayment = (data) => api.post('/orders/verify-payment', data)
export const getMyOrders = () => api.get('/orders/my-orders')
export const getOrderById = (id) => api.get(`/orders/${id}`)