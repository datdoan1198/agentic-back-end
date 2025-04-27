import {Conversation} from '@/models'
import {isValidObjectId} from 'mongoose'
import {abort} from '@/utils/helpers'

export async function checkConversationWithChat(req, res, next) {
    const conversation = await Conversation.findOne({_id: req.body.conversation_id})
    req.conversation = null
    if (conversation) {
        req.conversation = conversation
    }
    next()
}


export async function checkConversationExit(req, res, next) {
    if (isValidObjectId(req.params.conversationId)) {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            bot_id: req.bot._id
        })

        if (conversation) {
            req.conversation = conversation
            next()
            return
        }
    }

    abort(404, 'Cuộc hội thoại không tồn tại.')
}
