const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const authController = require('../controllers/auth.controller')
const { protect } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')

// Validation rules
const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const loginRules = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
]

router.post('/register', registerRules, validate, authController.register)
router.get('/verify/:token', authController.verifyEmail)
router.post('/login', loginRules, validate, authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password/:token', authController.resetPassword)
router.get('/me', protect, authController.getMe)

module.exports = router