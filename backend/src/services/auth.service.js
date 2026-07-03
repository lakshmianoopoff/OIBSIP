const crypto = require('crypto')
const User = require('../models/User')
const OtpToken = require('../models/OtpToken')
const RefreshToken = require('../models/RefreshToken')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens')
const { sendEmail, emailTemplates } = require('../utils/sendEmail')

// ── Register ──────────────────────────────────────────────
const register = async ({ name, email, password }) => {
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        const error = new Error('Email already registered')
        error.statusCode = 409
        throw error
    }

    // Create user — password gets hashed by the pre-save hook in the model
    const user = await User.create({ name, email, password })

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24 hours

    await OtpToken.create({
        userId: user._id,
        token,
        purpose: 'verify_email',
        expiresAt,
    })

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`
    const template = emailTemplates.verifyEmail(user.name, verifyUrl)
    await sendEmail({ to: user.email, ...template })

    return { message: 'Registration successful. Please check your email to verify your account.' }
}

// ── Verify Email ──────────────────────────────────────────
const verifyEmail = async (token) => {
    const otpRecord = await OtpToken.findOne({ token, purpose: 'verify_email' })

    if (!otpRecord) {
        const error = new Error('Invalid or expired verification link')
        error.statusCode = 400
        throw error
    }

    await User.findByIdAndUpdate(otpRecord.userId, { isVerified: true })
    await OtpToken.deleteOne({ _id: otpRecord._id })

    return { message: 'Email verified successfully. You can now log in.' }
}

// ── Login ─────────────────────────────────────────────────
const login = async ({ email, password }) => {
    // Explicitly select password since it has select: false in schema
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
        const error = new Error('Invalid email or password')
        error.statusCode = 401
        throw error
    }

    if (!user.isVerified) {
        const error = new Error('Please verify your email before logging in')
        error.statusCode = 403
        throw error
    }

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = await generateRefreshToken(user._id)

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    }
}

// ── Refresh Token ─────────────────────────────────────────
const refresh = async (token) => {
    if (!token) {
        const error = new Error('No refresh token provided')
        error.statusCode = 401
        throw error
    }

    const storedToken = await RefreshToken.findOne({ token })

    if (!storedToken || storedToken.expiresAt < new Date()) {
        const error = new Error('Invalid or expired refresh token')
        error.statusCode = 401
        throw error
    }

    const user = await User.findById(storedToken.userId)
    const accessToken = generateAccessToken(user._id, user.role)

    return { accessToken }
}

// ── Logout ────────────────────────────────────────────────
const logout = async (token) => {
    await RefreshToken.deleteOne({ token })
    return { message: 'Logged out successfully' }
}

// ── Forgot Password ───────────────────────────────────────
const forgotPassword = async (email) => {
    const user = await User.findOne({ email })

    // Always return success even if email doesn't exist
    // This prevents user enumeration attacks
    if (!user) return { message: 'If that email exists, a reset link has been sent.' }

    // Delete any existing reset tokens for this user
    await OtpToken.deleteMany({ userId: user._id, purpose: 'reset_password' })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)  // 1 hour

    await OtpToken.create({
        userId: user._id,
        token,
        purpose: 'reset_password',
        expiresAt,
    })

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`
    const template = emailTemplates.resetPassword(user.name, resetUrl)
    await sendEmail({ to: user.email, ...template })

    return { message: 'If that email exists, a reset link has been sent.' }
}

// ── Reset Password ────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
    const otpRecord = await OtpToken.findOne({ token, purpose: 'reset_password' })

    if (!otpRecord) {
        const error = new Error('Invalid or expired reset link')
        error.statusCode = 400
        throw error
    }

    const user = await User.findById(otpRecord.userId)
    user.password = newPassword  // pre-save hook will hash it
    await user.save()

    await OtpToken.deleteOne({ _id: otpRecord._id })

    return { message: 'Password reset successfully. You can now log in.' }
}

module.exports = { register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword }