require('dotenv').config()
const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')
const { initSocket } = require('./sockets/orderSocket')
const stockAlertJob = require('./jobs/stockAlert.cron')

const PORT = process.env.PORT || 5000

const startServer = async () => {
    await connectDB()

    const server = http.createServer(app)

    // Initialize Socket.io — must happen before server.listen
    initSocket(server)

    // Start cron jobs
    stockAlertJob()

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    })
}

startServer()