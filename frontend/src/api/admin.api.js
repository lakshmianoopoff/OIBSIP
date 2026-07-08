import api from './axios'

export const getDashboardStats = () => api.get('/admin/dashboard')
export const getAllOrders = (params) => api.get('/admin/orders', { params })
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status })
export const getInventory = () => api.get('/admin/inventory')
export const restockIngredient = (id, quantity) => api.put(`/admin/inventory/${id}/restock`, { quantity })