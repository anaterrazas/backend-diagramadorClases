import jwt from 'jsonwebtoken'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export const socketJWTAuth = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token

  if (!token) {
    console.warn('[Socket Auth] Token no proporcionado')
    return next(new Error('Token no proporcionado'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; correo: string }

    // ✅ Guardar en socket.data
    socket.data.user = decoded

    console.log('[Socket Auth] Usuario autenticado:', decoded.correo)
    next()
  } catch (err: any) {
    console.error('[Socket Auth] Error al verificar token:', err.message)
    next(new Error('Token inválido o expirado'))
  }
}
