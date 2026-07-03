const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendError } = require('../utils/apiResponse')

const protect = async (req, res, next) => {
    try {
        // Token comes in Authorization header as "Bearer <token>"
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 401, 'Not authorized, no token')
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Attach user to request object — available in all subsequent middleware and controllers
        req.user = await User.findById(decoded.id).select('-password')

        if (!req.user) return sendError(res, 401, 'User no longer exists')

        next()
    } catch (err) {
        return sendError(res, 401, 'Not authorized, invalid token')
    }
}

module.exports = { protect }
