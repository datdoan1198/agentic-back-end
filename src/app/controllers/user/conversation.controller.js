import * as conversationService from  '@/app/services/conversation.service'
import {Message} from '@/models'

export async function getListConversation(req, res) {
    res.status(201).jsonify(await conversationService.getListConversation(req.query, req.bot))
}

export async function getListMessageOfConversation(req, res) {
    res.status(201).jsonify(await conversationService.getListMessage(req.query, req.conversation))
}

export async function getAllListMessageOfConversation(req, res) {
    const messages = await Message.find({conversation_id: req.conversation._id}).sort({ created_at: 'desc' }).lean()
    res.status(201).jsonify(messages)
}
