import * as botService from '@/app/services/bot.service'
import * as fbService from '@/app/services/facebook.service'
import { db } from '@/configs'
import { FacebookService } from '@/models'
import OpenAI from 'openai'

export async function getListBotChats(req, res) {
    res.status(201).jsonify(await botService.filter(req.currentUser))
}

export async function create(req, res) {
    await db.transaction(async function (session) {
        const result = await botService.createBot(req.currentUser, req.infoUrl, session)
        res.status(201).jsonify(result)
    })
}

export async function updateBot(req, res) {
    await db.transaction(async function (session) {
        const result = await botService.updateBot(req.currentUser, req.bot, req.body, session)
        res.status(201).jsonify(result, 'Update bot success')
    })
}

export async function getDetailBot(req, res) {
    res.status(201).jsonify(await botService.getDetailBot(req.params.botId))
}

export async function deleteBot(req, res) {
    await db.transaction(async function (session) {
        const result = await botService.deleteBot(req.currentUser, req.bot, session)
        res.status(200).jsonify(result, 'Delete bot success')
    })
}

export async function getLinks(req, res) {
    const result = await botService.getLinks(req.bot, req.query)
    res.status(200).jsonify(result)
}

export async function createLink(req, res) {
    await db.transaction(async function (session) {
        await botService.createLink(req.bot, req.body, session)
        res.status(201).jsonify('Create link success')
    })
}

export async function viewLinkContent(req, res) {
    const result = await botService.viewLinkContent(req.bot, req.params.linkId)
    res.status(200).jsonify(result)
}

export async function rescanLink(req, res) {
    await db.transaction(async function (session) {
        const result = await botService.rescanLink(req.bot, req.params.linkId, session)
        res.status(200).jsonify(result)
    })
}

export async function deleteLink(req, res) {
    const result = await botService.deleteLink(req.currentUser, req.bot, req.params.linkId)
    res.status(200).jsonify(result, 'Delete link success')
}

export async function getPageFb(req, res) {
    res.status(201).jsonify(await fbService.getListPageFB(req.bot))
}

export async function selectPageFB(req, res) {
    await db.transaction(async function (session) {
        const result = await fbService.selectPage(req.bot, req.body.page_id, session)
        res.status(201).jsonify(result)
    })
}

export function verifyPageFb(req, res) {
    const VERIFY_TOKEN = process.env.VITE_VERIFY_TOKEN_PAGE_FB

    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge)
    } else {
        res.sendStatus(403)
    }
}

export async function receiveMessageFb(req, res) {
    try {
        const { object, entry } = req.body

        if (object !== 'page') {
            return res.sendStatus(404)
        }

        for (const item of entry) {
            const fbConfig = await FacebookService.findOne({ page_id: item.id })

            if (!fbConfig || !fbConfig.page_access_token) {
                continue
            }

            for (const event of item.messaging) {
                if (event.message && event.sender) {
                    const senderId = event.sender.id
                    // const userMessage = event.message.text

                    if (parseInt(senderId) !== fbConfig.page_id) {
                        await fbService.sendMessage(
                            fbConfig.page_access_token,
                            senderId,
                            'Xin chào! Cảm ơn bạn đã nhắn tin cho chúng tôi. 😊'
                        )
                    }
                }
            }
        }
        res.sendStatus(200)
    } catch (error) {
        console.error('Error receiveMessageFb:', error)
        return res.sendStatus(500)
    }
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function demo(req, res) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: 'Kiến thức cần mã hóa...',
        })

        const embedding = response.data[0].embedding

        res.status(201).jsonify(embedding)
    } catch (error) {
        console.error('Error xxxx:', error)
        return res.sendStatus(500)
    }
}
