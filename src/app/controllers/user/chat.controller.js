import {db} from '@/configs'
import * as conversationService from '@/app/services/conversation.service'
import * as openAIService from '@/app/services/openAI.service'
import * as ConversationOrderService from '@/app/services/conversation-order.service'
import {KEYS_ACCEPT, KEYS_CANCEL, KEYS_ORDER, Message, STATUS_CONVERSATION_ORDER, TYPE_CONVERSATION} from '@/models'

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
            promptOrder =  await handleGetPromptOrder(send_message, conversation_id)
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

async function handleGetPromptOrder (send_message, conversation_id, session) {
    const oldOrder = await ConversationOrderService.getConversationOrder(conversation_id)
    const isOrder = isStatusOrder(send_message, KEYS_ORDER)
    const isAccept = isStatusOrder(send_message, KEYS_ACCEPT)
    const isCancel = isStatusOrder(send_message, KEYS_CANCEL)

    if (isAccept && oldOrder?.status === STATUS_CONVERSATION_ORDER.PENDING) {
        const isValidObject = Object.values(JSON.parse(oldOrder.order_information)).every(value => value !== null && value !== '')
        if (isValidObject) {
            await ConversationOrderService.updateStatusConversationOrder(
                conversation_id, STATUS_CONVERSATION_ORDER.ACCEPT, session
            )
            return '// Thông báo đơn hàng đã được đặt thành công, yêu cầu khách hàng để ý điện thoại'
        }
    }

    if (isCancel && oldOrder?.status === STATUS_CONVERSATION_ORDER.PENDING) {
        await ConversationOrderService.updateStatusConversationOrder(
            conversation_id, STATUS_CONVERSATION_ORDER.CANCEL, session
        )
        return '// Thông báo đơn hàng đã được hủy'
    }

    const formOrder = [
        {
            label: 'Họ và tên',
            value: 'name'
        },
        {
            label: 'Số điện thoại',
            value: 'phone'
        },
        {
            label: 'Địa chỉ',
            value: 'address'
        },
        {
            label: 'Số lượng',
            value: 'quantity'
        },
        {
            label: 'Loại sản phẩm',
            value: 'type'
        }
    ]

    let orderInformation = []

    if (isOrder || oldOrder?.status === STATUS_CONVERSATION_ORDER.PENDING) {
        let stringifyOrderInformation

        if (oldOrder) {
            stringifyOrderInformation = oldOrder.order_information
        } else {
            const convertFormOrder = formOrder.reduce((acc, item) => {
                acc[item.value] = ''
                return acc
            }, {})

            stringifyOrderInformation = JSON.stringify(convertFormOrder)
        }

        orderInformation = await openAIService.getInfoOrder(send_message, stringifyOrderInformation)

        if (oldOrder) {
            orderInformation = mergeOrderInfo(JSON.parse(oldOrder.order_information), orderInformation)
        }

        await ConversationOrderService.createOrUpdateConversationOrder(
            conversation_id, JSON.stringify(orderInformation), session
        )
    }

    return openAIService.getPromptOrder(formOrder, orderInformation)
}

function mergeOrderInfo(current, extracted) {
    const result = { ...current }
    for (const key in extracted) {
        const value = extracted[key]
        if (value && value.trim() !== '') {
            result[key] = value.trim()
        }
    }
    return result
}

function isStatusOrder(text, keywords) {
    const lower = text.toLowerCase()
    return keywords.some(k => lower.includes(k))
}

