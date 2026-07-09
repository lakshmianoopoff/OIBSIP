import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'

export default function useOrderSocket(orderId, initialStatus) {
  const { socket } = useSocket()
  const [status, setStatus] = useState(initialStatus)
  const [justUpdated, setJustUpdated] = useState(false)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  useEffect(() => {
    if (!socket || !orderId) return

    const handleStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status)
        // Flash animation trigger
        setJustUpdated(true)
        setTimeout(() => setJustUpdated(false), 2000)
      }
    }

    socket.on('order_status_update', handleStatusUpdate)

    return () => {
      socket.off('order_status_update', handleStatusUpdate)
    }
  }, [socket, orderId])

  return { status, justUpdated }
}