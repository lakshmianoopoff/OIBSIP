import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false)
    const { accessToken, user } = useAuthStore()

    useEffect(() => {
        // Only connect if user is logged in
        if (!accessToken || !user) return

        socketRef.current = io('/', {
            auth: { token: accessToken },  // sent to socket auth middleware on backend
            transports: ['websocket'],
        })

        socketRef.current.on('connect', () => {
            setIsConnected(true)
            console.log('Socket connected')
        })

        socketRef.current.on('disconnect', () => {
            setIsConnected(false)
        })

        // Cleanup on logout or token change
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [accessToken, user])

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext)