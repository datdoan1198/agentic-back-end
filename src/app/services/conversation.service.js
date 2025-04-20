import {Conversation, Message, TYPE_MESSAGE} from '@/models'

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

export async function createMessage({userId, userMessage}, messageSend, fbConfigBot, type, session) {
    const conversion = await Conversation.findOneAndUpdate(
        {
            platform_user_id: userId,
            bot_id: fbConfigBot.bot_id,
        },
        {
            $setOnInsert: {
                platform_user_id: userId,
                bot_id: fbConfigBot.bot_id,
                type,
            }
        },
        {
            new: true,
            upsert: true,
            session
        }
    )

    const saveMessageReceive = new Message({
        sender_id: userId,
        content: userMessage,
        conversation_id: conversion._id,
        type: TYPE_MESSAGE.USER
    })

    await saveMessageReceive.save({session})

    const saveMessageSend  = new Message({
        sender_id: fbConfigBot.page_id,
        content: messageSend,
        conversation_id: conversion._id,
    })

    await saveMessageSend.save({session})
    return true
}
