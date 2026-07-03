const mongoose = require('mongoose')

const otpTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ['verify_email', 'reset_password'],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
})

// Auto-delete expired tokens — MongoDB TTL index
// MongoDB checks every 60 seconds and deletes documents where expiresAt has passed
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('OtpToken', otpTokenSchema)
