import {Conversation, Message, WebKnowledge, FileKnowledge} from '@/models'
import moment from 'moment'

export async function getGeneralStatistics (query, bot) {
    const {startDay, endDay} = normalizeDateRange(query)

    const filter = {
        ...(startDay && endDay && { created_at: {$gte: startDay, $lte: endDay} }),
        bot_id: bot._id,
    }

    const conversationIds = await Conversation.find(filter).distinct('_id')
    const totalConversation = conversationIds.length
    const totalLink = await WebKnowledge.countDocuments(filter)
    const totalFile = await FileKnowledge.countDocuments(filter)
    const totalMessages = await Message.countDocuments({conversation_id: {$in: conversationIds}})
    const averageNumberMessages = totalConversation > 0 ? totalMessages / totalConversation : 0

    return {
        number_user_access: totalConversation,
        total_conversation: totalConversation,
        average_number_messages: averageNumberMessages,
        total_messages: totalMessages,
        total_link: totalLink,
        total_file: totalFile,
    }
}

function normalizeDateRange({start_day, end_day}) {
    let endDay = end_day ? moment(end_day, 'DD-MM-YYYY') : null
    let startDay = start_day
        ? moment(start_day, 'DD-MM-YYYY')
        : null

    startDay = startDay && startDay.isValid() ? startDay.startOf('day') : null
    endDay = endDay && endDay.isValid() ? endDay.endOf('day') : null

    return {startDay, endDay}
}
