import { db } from '@/configs/index.js'
import * as socketService from '../../services/socket.service.js'

export async function processMessage(req, io, socketId) {
    await db.transaction(async function (session) {
        const result = await socketService.sendMessage(req.currentUser._id, req.body, io, socketId, session)
        return result
    })
}
