const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const errorHandler = require('./middlewares/error.middleware')

const app = express()

// Security headers
app.use(helmet())

// CORS — allow only your frontend origin
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true   // allows cookies to be sent cross-origin
}))

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rate limiting on all routes — prevents abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 100,                     // max 100 requests per IP per window
    message: 'Too many requests, please try again later'
})
app.use('/api', limiter)

// Health check route — useful for Docker + deployment
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'))
app.use('/api/v1/ingredients', require('./routes/ingredient.routes'))
app.use('/api/v1/orders', require('./routes/order.routes'))

// Global error handler — must be last
app.use(errorHandler)

module.exports = app