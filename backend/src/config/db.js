const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`)
        process.exit(1)   // exit the process if DB fails — no point running without a database
    }
}

module.exports = connectDB

