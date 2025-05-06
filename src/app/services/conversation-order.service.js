import {ConversationOrder, STATUS_CONVERSATION_ORDER} from '@/models'

export async function createOrUpdateConversationOrder(conversation_id, order_information, session) {
    const conversationOrder = await ConversationOrder.findOneAndUpdate(
        { conversation_id, status: STATUS_CONVERSATION_ORDER.PENDING },
        {
            order_information
        },
        {
            upsert: true,
            new: true,
            session: session
        }
    )

    return conversationOrder
}

export async function getConversationOrder(conversation_id) {
    const conversationOrder = await ConversationOrder.findOne(
        { conversation_id, status: STATUS_CONVERSATION_ORDER.PENDING }
    )

    return conversationOrder
}

export async function updateStatusConversationOrder(conversation_id, status, session) {
    const conversationOrder = await ConversationOrder.findOneAndUpdate(
        { conversation_id, status: STATUS_CONVERSATION_ORDER.PENDING },
        {
            status
        },
        {
            new: true,
            session: session
        }
    )

    return conversationOrder
}
