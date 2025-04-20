import * as conversationService from  '@/app/services/conversation.service'

export async function getListConversation(req, res) {
    res.status(201).jsonify(await conversationService.getListConversation(req.query, req.bot))
}

export async function getListMessageOfConversation(req, res) {
    res.status(201).jsonify(await conversationService.getListMessage(req.query, req.conversation))
}
