const express = require('express')
const router = express.Router()
const ingredientController = require('../controllers/ingredient.controller')
const { protect } = require('../middlewares/auth.middleware')
const { restrictTo } = require('../middlewares/role.middleware')

// Public — user facing pizza builder
router.get('/', ingredientController.getAllIngredients)
router.get('/:type', ingredientController.getIngredientsByType)

// Admin only
router.get('/admin/all', protect, restrictTo('admin'), ingredientController.getAllForAdmin)
router.post('/', protect, restrictTo('admin'), ingredientController.addIngredient)
router.put('/:id', protect, restrictTo('admin'), ingredientController.updateIngredient)
router.delete('/:id', protect, restrictTo('admin'), ingredientController.deleteIngredient)

module.exports = router