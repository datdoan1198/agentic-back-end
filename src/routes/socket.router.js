// import { userSockets } from '..'
import { socketAuthentication } from '@/app/middleware/user/auth.middleware'
import chatRouter from './socket/chat.router'
// Lưu trữ các socket ID và user ID tương ứng
export const userSockets = {}

const socketRouter = async (io) => {
    await io.on('connection', async (socket) => {
        console.log('User connected:', socket.id)
        await socket.on('login', async (token) => {
            await socketAuthentication(socket, token)
        }),
        await chatRouter(socket, io)

        await disconnectHandler(socket)
    })
}

const disconnectHandler = async (socket) => {
    await socket.on('disconnect', () => {
        const user_id = userSockets[socket.id]
        if (user_id) {
            delete userSockets[socket.id]
        }
        console.log('User disconnected:', socket.id)
    })
}

export default socketRouter
