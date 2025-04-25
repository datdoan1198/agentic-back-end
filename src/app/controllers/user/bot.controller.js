import * as botService from '@/app/services/bot.service'
import * as fbService from '@/app/services/facebook.service'
import * as openAIService from '@/app/services/openAI.service'
import * as conversationService from '@/app/services/conversation.service'
import {db} from '@/configs'
import {FacebookService, STATUS_BOT, TYPE_CONVERSATION} from '@/models'

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

export async function updateStatus(req, res) {
    await db.transaction(async function () {
        const result = await botService.handleUpdateStatus(req.bot, req.body)
        res.status(201).jsonify(result)
    })
}

export async function deleteBot(req, res) {
    await db.transaction(async function (session) {
        const result = await botService.deleteBot(req.bot, session)
        res.status(200).jsonify(result, 'Delete bot success')
    })
}

// Link
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

export function viewLinkContent(req, res) {
    res.status(200).jsonify(req.link)
}

export async function rescanLink(req, res) {
    await db.transaction(async function (session) {
        const result = await botService.rescanLink(req.bot, req.link, session)
        res.status(200).jsonify(result)
    })
}

export async function deleteLink(req, res) {
    await botService.deleteLink(req.bot, req.link)
    res.status(200).jsonify()
}

// FB
export async function getPageFb(req, res) {
    res.status(201).jsonify(await fbService.getListPageFB(req.bot))
}

export async function selectPageFB(req, res) {
    await db.transaction(async function (session) {
        const result = await fbService.selectPage(req.bot, req.body.page_id, session)
        res.status(201).jsonify(result)
    })
}

export async function unlinkPageFB(req, res) {
    await db.transaction(async function (session) {
        await FacebookService.deleteMany({bot_id: req.bot._id,}, {session})
        res.status(201).jsonify()
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
            const fbConfig = await FacebookService.findOne({ page_id: item.id }).populate('bot')

            if (
                !fbConfig ||
                !fbConfig.page_access_token ||
                !fbConfig.bot ||
                fbConfig.bot.status === STATUS_BOT.DE_ACTIVE
            ) {
                continue
            }

            for (const event of item.messaging) {
                if (event.message && event.sender) {
                    const senderId = event.sender.id
                    const userMessage = event.message.text
                    const messageSend = await openAIService.askOpenAI(userMessage, fbConfig.bot_id)

                    if (parseInt(senderId) !== fbConfig.page_id) {
                        await fbService.sendMessage(fbConfig.page_access_token, senderId, messageSend)
                        await db.transaction(async function (session) {
                            await conversationService.createMessage(
                                {
                                    receiver_id: senderId,
                                    user_message: userMessage
                                },
                                {
                                    sender_id: fbConfig.page_id,
                                    bot_message: messageSend
                                },
                                TYPE_CONVERSATION.FB,
                                fbConfig.bot_id,
                                session
                            )
                        })
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
