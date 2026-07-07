const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const ingredientController = require('../controllers/ingredient.controller')
const { protect } = require('../middlewares/auth.middleware')
const { restrictTo } = require('../middlewares/role.middleware')

// All admin routes require login + admin role
// Apply both middlewares once at router level instead of repeating on every route
router.use(protect, restrictTo('admin'))

// Dashboard
router.get('/dashboard', adminController.getDashboardStats)

// Order management
router.get('/orders', adminController.getAllOrders)
router.get('/orders/:id', adminController.getOrderById)
router.put('/orders/:id/status', adminController.updateOrderStatus)

// Inventory management
router.get('/inventory', adminController.getInventory)
router.post('/inventory', ingredientController.addIngredient)
router.put('/inventory/:id', ingredientController.updateIngredient)
router.put('/inventory/:id/restock', adminController.restockIngredient)
router.delete('/inventory/:id', ingredientController.deleteIngredient)

module.exports = router