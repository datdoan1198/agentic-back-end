import { abort } from '@/utils/helpers'
import { Bot, STATUS_BOT } from '@/models'
import { handleGetInfoPage } from '@/app/services/bot.service'
import { isValidObjectId } from 'mongoose'

export async function checkUrlBotExist(req, res, next) {
    const bot = await Bot.findOne({
        user_id: req.currentUser._id,
        url: { $regex: `^${req.body.url.replace(/\/+$/, '')}`, $options: 'i' },
    })
    if (!bot) {
        req.infoUrl = await handleGetInfoPage(req.body.url)
        next()
        return
    }

    abort(404, 'Bot đã tồn tại.')
}

export async function checkBotExist(req, res, next) {
    if (isValidObjectId(req.params.botId)) {
        const bot = await Bot.findOne({
            _id: req.params.botId,
            status: STATUS_BOT.ACTIVE,
            user_id: req.currentUser._id,
        }).populate('fb')

        if (bot) {
            req.bot = bot
            next()
            return
        }
    }

    abort(404, 'Bot không tồn tại.')
}

export async function parseFormData(req, res, next) {
    if (req.method === 'PUT' && req.headers['content-type']?.includes('multipart/form-data')) {
        const data = await req.body

        if (data.quick_prompts) {
            // data.quick_prompts = JSON.parse(data.quick_prompts)
            console.log('quick_prompts', data.quick_prompts)
        }
        next()
    } else {
        next()
    }
}
