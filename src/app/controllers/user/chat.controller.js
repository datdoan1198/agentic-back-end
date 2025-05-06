import {db} from '@/configs'
import * as conversationService from '@/app/services/conversation.service'
import * as openAIService from '@/app/services/openAI.service'
import { Message, TYPE_CONVERSATION} from '@/models'


export async function create(req, res) {
    const { send_message } = req.body
    const conversation_id = req?.conversation?._id || null
    let historyMessage = []
    if (conversation_id) {
        historyMessage = await conversationService.handleGetMessageOfOpenAI(conversation_id)
    }
    await db.transaction(async function (session) {
        let promptOrder = null
        if (req.bot.config_bot?.is_order && conversation_id) {
            promptOrder =  await openAIService.handleGetPromptOrder(send_message, conversation_id, session)
        }

        const user = {
            receiver_id: 'web_client',
            user_message: send_message
        }

        const messageSendUser = await openAIService.askOpenAI(send_message, req.bot._id, historyMessage, promptOrder)
        const bot = {
            sender_id: 'web_bot',
            bot_messages: [
                messageSendUser
            ]
        }

        const conversation = await conversationService.createMessage(
            user, bot, TYPE_CONVERSATION.WEB, req.bot._id, session, conversation_id, req.bot.name
        )
        const messages = await Message.find({conversation_id: conversation._id})
            .sort({ created_at: 'desc' })
            .session(session)
            .lean()

        res.status(201).jsonify({
            conversation_id: conversation._id,
            messages
        })
    })
}

