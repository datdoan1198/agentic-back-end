import {Conversation, Message, WebKnowledge, FileKnowledge, TYPE_MESSAGE} from '@/models'
import moment from 'moment'
const dayjs = require('dayjs')

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
        number_user_access: Math.round(totalConversation),
        total_conversation: Math.round(totalConversation),
        average_number_messages: Math.round(averageNumberMessages),
        total_messages: Math.round(totalMessages),
        total_link: Math.round(totalLink),
        total_file: Math.round(totalFile),
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

export async function getTotalMessageByDay (bot) {
    const dataChartTotalMessageByDay = []
    const days = []

    for (let i = 0; i < 15; i++) {
        days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
    }

    const conversationIds = await Conversation.find({bot_id: bot._id}).distinct('_id')
    for (const day of days.reverse()) {
        const startOfDay = dayjs(day).startOf('day').toDate()
        const endOfDay = dayjs(day).endOf('day').toDate()

        const totalMessages = await Message.countDocuments({
            conversation_id: {$in: conversationIds},
            created_at: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        })
        dataChartTotalMessageByDay.push({
            day,
            number_message: totalMessages
        })
    }

    return dataChartTotalMessageByDay
}

export async function getLatestMessage (bot) {
    const conversationIds = await Conversation.find({bot_id: bot._id}).distinct('_id')
    const latestMessages = await Message.find({
        conversation_id: {$in: conversationIds},
        type: TYPE_MESSAGE.USER
    }).populate('conversation')
        .limit(10)
        .sort({created_at: 'desc'})
        .lean()

    return latestMessages
}
