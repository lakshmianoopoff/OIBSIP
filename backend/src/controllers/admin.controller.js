const orderService = require('../services/order.service')
const adminService = require('../services/admin.service')
const ingredientService = require('../services/ingredient.service')
const { sendSuccess } = require('../utils/apiResponse')

const getDashboardStats = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats()
    sendSuccess(res, 200, 'Dashboard stats fetched', data)
  } catch (err) {
    next(err)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const data = await orderService.getAllOrders(req.query)
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

const updateOrderStatus = async (req, res, next) => {
  try {
    const data = await orderService.updateOrderStatus(req.params.id, req.body.status)
    sendSuccess(res, 200, 'Order status updated', data)
  } catch (err) {
    next(err)
  }
}

const getInventory = async (req, res, next) => {
  try {
    const data = await ingredientService.getAllForAdmin()
    sendSuccess(res, 200, 'Inventory fetched', data)
  } catch (err) {
    next(err)
  }
}

const restockIngredient = async (req, res, next) => {
  try {
    const data = await adminService.restockIngredient(req.params.id, req.body.quantity)
    sendSuccess(res, 200, 'Stock updated', data)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getDashboardStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getInventory,
  restockIngredient,
}