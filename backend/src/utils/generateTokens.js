const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const RefreshToken = require('../models/RefreshToken')

const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )
}

const generateRefreshToken = async (userId) => {
    // Use crypto for refresh token — not JWT
    // It's just a random string stored in DB, no payload needed
    const token = crypto.randomBytes(40).toString('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)  // 7 days from now

    // Delete any existing refresh tokens for this user (one session at a time)
    await RefreshToken.deleteMany({ userId })

    // Save new refresh token to DB
    await RefreshToken.create({ userId, token, expiresAt })

    return token
}

const setRefreshTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,    // JS cannot access this cookie — XSS protection
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
    })
}

module.exports = { generateAccessToken, generateRefreshToken, setRefreshTokenCookie }
