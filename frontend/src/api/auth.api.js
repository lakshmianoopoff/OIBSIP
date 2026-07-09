import api from './axios'

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const logoutUser = () => api.post('/auth/logout')
export const refreshToken = () => api.post('/auth/refresh')
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password })
export const verifyEmail = (token) => api.get(`/auth/verify/${token}`)
export const getMe = () => api.get('/auth/me')