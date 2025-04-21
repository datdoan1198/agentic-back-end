import * as socketController from '../../app/controllers/user/socket.controller'

const chatRouter = async (socket, io) => {
    await socket.on('message', async (data, callback) => {
        try {
            const req = {
                body: data,
                params: {},
                currentUser: socket.currentUser,
            }

            const result = await socketController.processMessage(req, io, socket.id)
            if (typeof callback === 'function') {
                callback({
                    status: 200,
                    success: true,
                    message: 'Send message successfully',
                    data: result,
                })
            }

            // Vẫn có thể emit sự kiện đến các client khác nếu cần
            // socket.broadcast.emit('new-message', result)
        } catch (error) {
            console.error('Error processing message:', error)
            if (typeof callback === 'function') {
                callback({
                    status: 500,
                    success: false,
                    message: 'Error processing message',
                    error: error.message,
                })
            }
        }
    })
}

export default chatRouter
