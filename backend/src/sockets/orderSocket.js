const jwt = require('jsonwebtoken')

// Store io instance so other parts of the app can emit events
let io

const initSocket = (server) => {
    const { Server } = require('socket.io')

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    })

    // Middleware — authenticate socket connection using JWT
    // User sends their access token when connecting
    io.use((socket, next) => {
        const token = socket.handshake.auth.token

        if (!token) {
            return next(new Error('Authentication error — no token'))
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            socket.userId = decoded.id
            socket.userRole = decoded.role
            next()
        } catch (err) {
            return next(new Error('Authentication error — invalid token'))
        }
    })

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} — user: ${socket.userId}`)

        // Each user joins their own private room named after their userId
        // This is how admin can target a specific user's dashboard
        socket.join(socket.userId)

        // Admin joins a separate admin room to receive order notifications
        if (socket.userRole === 'admin') {
            socket.join('admin_room')
            console.log(`Admin joined admin_room`)
        }

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`)
        })
    })

    return io
}

// Called from order service when status changes
// Emits to the specific user's room
const emitOrderStatusUpdate = (userId, orderId, status) => {
    if (!io) return

    io.to(userId.toString()).emit('order_status_update', {
        orderId,
        status,
        updatedAt: new Date().toISOString(),
    })
}

// Notify admin room when a new order is placed
const emitNewOrderToAdmin = (order) => {
    if (!io) return

    io.to('admin_room').emit('new_order', {
        orderId: order._id,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        createdAt: order.createdAt,
    })
}

module.exports = { initSocket, emitOrderStatusUpdate, emitNewOrderToAdmin }