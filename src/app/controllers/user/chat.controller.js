import {db} from '@/configs'
import * as conversationService from '@/app/services/conversation.service'
import * as openAIService from '@/app/services/openAI.service'
import {ConversationSummary, DEFAULT_FORM_ORDER, Message, STATUS_ORDER, TYPE_CONVERSATION} from '@/models'
const { customAlphabet } = require('nanoid')

export async function create(req, res) {
    const { send_message } = req.body
    const conversation_id = req?.conversation?._id || null
    let historyMessage = ''
    if (conversation_id) {
        const historyConversation = await ConversationSummary.findOne({conversation_id})
        historyMessage = historyConversation?.content || ''
    }
    await db.transaction(async function (session) {
        let promptOrder = null
        if (req.bot?.is_order === STATUS_ORDER.ACTIVE && conversation_id) {
            const valueFormOrder = JSON.parse(req.bot.order_config.form_order)
            const formOrder = DEFAULT_FORM_ORDER.filter(item => valueFormOrder.includes(item.value))
            promptOrder =  await openAIService.handleGetPromptOrder(send_message, conversation_id, formOrder, session)
        }
        const nanoid = await customAlphabet('0123456789', 6)
        const user = {
            receiver_id: nanoid(),
            user_message: send_message
        }

        const messageSendUser = await openAIService.askOpenAI(send_message, req.bot, historyMessage, promptOrder)
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

