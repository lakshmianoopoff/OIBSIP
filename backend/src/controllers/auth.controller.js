const authService = require('../services/auth.service')
const { sendSuccess, sendError } = require('../utils/apiResponse')
const { setRefreshTokenCookie } = require('../utils/generateTokens')

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body)
        sendSuccess(res, 201, result.message)
    } catch (err) {
        next(err)
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const result = await authService.verifyEmail(req.params.token)
        sendSuccess(res, 200, result.message)
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body)
        setRefreshTokenCookie(res, result.refreshToken)
        sendSuccess(res, 200, 'Login successful', {
            accessToken: result.accessToken,
            user: result.user,
        })
    } catch (err) {
        next(err)
    }
}

const refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        const result = await authService.refresh(token)
        sendSuccess(res, 200, 'Token refreshed', { accessToken: result.accessToken })
    } catch (err) {
        next(err)
    }
}

const logout = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        await authService.logout(token)
        res.clearCookie('refreshToken')
        sendSuccess(res, 200, 'Logged out successfully')
    } catch (err) {
        next(err)
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body.email)
        sendSuccess(res, 200, result.message)
    } catch (err) {
        next(err)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const result = await authService.resetPassword(req.params.token, req.body.password)
        sendSuccess(res, 200, result.message)
    } catch (err) {
        next(err)
    }
}

const getMe = async (req, res, next) => {
    try {
        // req.user is set by auth middleware
        sendSuccess(res, 200, 'User fetched', req.user)
    } catch (err) {
        next(err)
    }
}

module.exports = { register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword, getMe }