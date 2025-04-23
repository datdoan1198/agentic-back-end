import { abort } from '@/utils/helpers'
import { Bot, Conversation, WebKnowledge } from '@/models'
import { handleGetInfoPage } from '@/app/services/bot.service'
import { isValidObjectId } from 'mongoose'

export async function checkUrlBotExist(req, res, next) {
    const url = new URL(req.body.url)
    const baseUrl = `${url.protocol}//${url.hostname}`

    const bot = await Bot.findOne({
        url: { $regex: `^${baseUrl.replace(/\/+$/, '')}`, $options: 'i' },
        deleted: false,
    })
    if (!bot) {
        req.infoUrl = await handleGetInfoPage(req.body.url)
        if (req.infoUrl) {
            next()
            return
        } else {
            abort(404, 'Đường dẫn không phù hợp.')
        }
    }

    abort(404, 'Bot cho dịch vụ này đã được tạo.')
}

export async function checkBotExist(req, res, next) {
    if (isValidObjectId(req.params.botId)) {
        const bot = await Bot.findOne({
            _id: req.params.botId,
            user_id: req.currentUser._id,
            deleted: false,
        }).populate('fb').populate('config_bot')

        if (bot) {
            req.bot = bot
            next()
            return
        }
    }

    abort(404, 'Bot không tồn tại.')
}

export async function checkLinkExist(req, res, next) {
    if (isValidObjectId(req.params.linkId)) {
        const link = await WebKnowledge.findOne({
            _id: req.params.linkId,
            bot_id: req.bot._id,
        }).select('url title description content')

        if (link) {
            req.link = link
            next()
            return
        }
    }

    abort(404, 'Đường dẫn không tồn tại.')
}

export async function parseFormData(req, res, next) {
    if (req.method === 'PUT' && req.headers['content-type']?.includes('multipart/form-data')) {
        const data = await req.body

        if (data.welcome_messages) {
            data.welcome_messages = JSON.parse(data.welcome_messages)
        }
        if (data.quick_prompts) {
            data.quick_prompts = JSON.parse(data.quick_prompts)
        }
        next()
    } else {
        next()
    }
}

export async function checkConversationExist(req, res, next) {
    if (isValidObjectId(req.params.conversationId)) {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            bot_id: req.bot._id,
        })

        if (conversation) {
            req.conversation = conversation
            next()
            return
        }
    }

    abort(404, 'Cuộc hội thoại không tồn tại.')
}
