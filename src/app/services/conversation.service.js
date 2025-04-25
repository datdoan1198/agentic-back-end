import {Conversation, Message, TYPE_CONVERSATION, TYPE_MESSAGE} from '@/models'
import _ from 'lodash'

export async function getListConversation ({q, page, per_page, field, sort_order}, bot) {
    q = q ? {$regex: q, $options: 'i'} : null

    const filter = {
        ...(q && {$or: [{name: q}]}),
        bot_id: bot._id
    }

    const conversations = (
        await Conversation.find(filter)
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field || 'order']: sort_order || 'asc'})
            .lean()
    )

    for (const conversation of conversations) {
        conversation.lastMessage = await Message.findOne({
            conversation_id: conversation._id,
            type: TYPE_MESSAGE.USER
        }).sort({ 'created_at': -1 })
    }

    const total = await Conversation.countDocuments(filter)
    return {total, page, per_page, conversations}
}

export async function getListMessage ({q, page, per_page, field, sort_order}, conversation) {
    q = q ? {$regex: q, $options: 'i'} : null

    const filter = {
        ...(q && {$or: [{name: q}]}),
        conversation_id: conversation._id
    }

    const messages = (
        await Message.find(filter)
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field || 'created_at']: sort_order || 'desc'})
            .lean()
    )

    const total = await Message.countDocuments(filter)
    return {total, page, per_page, messages}
}

export async function createMessage(
    userInfo, botInfo, type, bot_id, session, conversation_id = null, bot_name = ''
) {
    const filter = {
        ...(type === TYPE_CONVERSATION.FB && {
            platform_user_id: userInfo.receiver_id,
            bot_id
        }),
        ...(type === TYPE_CONVERSATION.WEB && conversation_id ? { _id: conversation_id } : {})
    }

    const conversationInfo = {
        platform_user_id: userInfo.receiver_id,
        bot_id,
        type,
    }
    let conversion

    if (_.isEmpty(conversation_id) && TYPE_CONVERSATION.WEB) {
        conversion = new Conversation(conversationInfo)
        await conversion.save({ session })
        await handleCreateMessageBot({
            sender_id: 'web_bot',
            bot_messages: [
                `Xin chào, mình là trợ lý ảo của ${bot_name}👋`,
                'Bạn cần mình hỗ trợ gì? 😊'
            ]
        }, conversion._id, session)
    } else {
        conversion = await Conversation.findOneAndUpdate(
            filter,
            {$setOnInsert: conversationInfo},
            {new: true, upsert: true, session}
        )
    }

    await handleSaveMessage(userInfo, botInfo, conversion._id, session)

    return conversion
}

async function handleSaveMessage ({receiver_id, user_message}, {sender_id, bot_messages}, conversation_id, session) {
    if (user_message) {
        const saveMessageReceive = new Message({
            sender_id: receiver_id,
            content: user_message,
            conversation_id,
            type: TYPE_MESSAGE.USER
        })
        await saveMessageReceive.save({session})
    }

    await handleCreateMessageBot({sender_id, bot_messages}, conversation_id, session)
}

async function handleCreateMessageBot ({sender_id, bot_messages}, conversation_id, session) {
    if (bot_messages && bot_messages.length > 0) {
        for (const message of bot_messages) {
            const saveMessageSend  = new Message({
                sender_id,
                content: message,
                conversation_id,
            })

            await saveMessageSend.save({session})
        }

    }
}

