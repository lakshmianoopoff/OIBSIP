require('dotenv').config()
const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

const startServer = async () => {
    // Connect to MongoDB first
    await connectDB()

    // Create HTTP server from Express app
    // We use http.createServer instead of app.listen
    // because Socket.io needs access to the raw HTTP server
    const server = http.createServer(app)

    // Socket.io will be initialized here in Week 2
    // const initSocket = require('./sockets/orderSocket')
    // initSocket(server)
    // Start cron jobs
    const stockAlertJob = require('./jobs/stockAlert.cron')
    stockAlertJob()


    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    })
}

startServer()