import axios from 'axios'
import _ from 'lodash'
import {Bot, FacebookService} from '@/models'
import {cache} from '@/configs'

export const pageFB = cache.create('list-page-fb')

export async function getListPageFB(bot) {
    if (_.isEmpty(bot.fb)) {
        return false
    }

    const isCheckAccessToken = await handleCheckAccessToken(bot.fb.access_token)

    if (isCheckAccessToken) {
        const tokenResponse = await axios.get(
            'https://graph.facebook.com/v20.0/me/accounts',
            {
                params: {
                    access_token: bot.fb.access_token,
                },
            }
        )

        const result = []
        const dataCache = []

        const dataPage = tokenResponse.data.data

        if (dataPage && dataPage.length > 0) {
            dataPage.forEach((page) => {
                dataCache.push({
                    id: page.id,
                    name: page.name,
                    access_token: page.access_token
                })

                result.push({
                    id: page.id,
                    category: page.category,
                    name: page.name,
                })
            })
        }

        await pageFB.set(bot._id, dataCache)
        return result
    } else {
        return false
    }
}

async function handleCheckAccessToken (access_token, bot) {
    const checkAccessToken = await axios.get('https://graph.facebook.com/me', {
        params: {access_token},
    })

    if (_.isEmpty(checkAccessToken)) {
        await Bot.findOneAndUpdate(
            { _id: bot._id },
            { deleted: true },
            {upsert: true}
        )
    }

    return !_.isEmpty(checkAccessToken)
}

export async function selectPage(bot, pageFbId, session) {
    const listPageFB = await pageFB.get(bot._id)
    if (listPageFB && listPageFB.length > 0) {
        const pageSelect = listPageFB.find((page) => page.id === pageFbId)
        const checkPageId = await FacebookService.findOne({page_id: pageSelect.id})

        if (checkPageId) {
            await FacebookService.deleteMany({
                bot_id: bot._id,
                page_id: { $ne: pageSelect.id }
            }, {session})
            await FacebookService.findOneAndUpdate(
                { page_id: pageSelect.id },
                {
                    page_access_token: pageSelect.access_token,
                    page_name: pageSelect.name,
                    bot_id: bot._id
                },
                {upsert: true, session}
            )
        } else {
            await FacebookService.findOneAndUpdate(
                { bot_id: bot._id },
                {
                    page_access_token: pageSelect.access_token,
                    page_name: pageSelect.name,
                    page_id: pageSelect.id,
                },
                {upsert: true, session}
            )
        }

    }

    await pageFB.clear()
    return true
}

export async function sendMessage (pageAccessToken, recipientId, message) {
    await axios.post(
        'https://graph.facebook.com/v20.0/me/messages',
        {
            recipient: { id: recipientId },
            message: { text: message },
        },
        {
            params: {
                access_token: pageAccessToken,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
}

export async function handleGetListMessageFanPageFB (pageId, pageAccessToken) {
    const params = {
        access_token: pageAccessToken,
        fields: 'id,updated_time,participants,message_count',
        limit: 50,
    }
    await axios.get(
        `https://graph.facebook.com/v20.0/${pageId}/conversations`,
        { params }
    ).then((res) => {
        console.log(res)
    }).catch((error) => {
        console.log(error.message)
    })

    return []
}
