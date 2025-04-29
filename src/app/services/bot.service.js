import {Bot, BotConfig, ColorMain, FacebookService, SCAN_TYPE, STATUS_TRAIN, WebKnowledge} from '@/models'
import _ from 'lodash'
import * as vectorKnowledgeService from '@/app/services/vector-knowledge.service'
import * as webKnowledgeService from '@/app/services/knowledge.service'
import {FileUpload} from '@/utils/classes'
import axios from 'axios'
import * as cheerio from 'cheerio'

export async function filter(currentUser) {
    const filter = {
        user_id: currentUser._id,
        deleted: false,
    }

    const bots = await Bot.find(filter).sort({ created_at: 'desc' }).lean()
    const botChats = bots.map((bot) => {
        if (bot.logo) {
            bot.logo = FileUpload.in(bot.logo)
        }
        if (bot.favicon) {
            bot.favicon = FileUpload.in(bot.favicon)
        }
        return bot
    })

    const total = await Bot.countDocuments(filter)
    return { total, botChats }
}

export async function getDetailBot(botId) {
    const bot = await Bot.findOne({ _id: botId, deleted: false }).populate('config_bot')
    const configFb = await FacebookService.findOne({ bot_id: botId })
    bot.is_connect_fb = !!configFb
    if (!_.isEmpty(configFb) && !_.isEmpty(configFb.page_access_token)) {
        bot.page = {
            id: configFb.page_id,
            name: configFb.page_name,
        }
    }
    if (bot?.config_bot?.logo_message) {
        bot.config_bot.logo_message = FileUpload.in(bot.config_bot.logo_message)
    }
    if (bot.favicon) {
        bot.favicon = FileUpload.in(bot.favicon)
    }
    return bot
}

export async function createBot(currentUser, infoUrl, session) {
    const bot = new Bot({
        ...infoUrl,
        user_id: currentUser._id,
    })
    await bot.save({ session })

    const config = new BotConfig({
        logo_message: infoUrl.favicon,
        color: ColorMain,
        bot_id: bot._id
    })
    await config.save({ session })

    infoUrl && infoUrl.url && await handleScanAllLinks(infoUrl, bot, session)
    return bot
}

export async function updateBot(currentUser, bot, data, session) {
    const {
        name, favicon,  description,
        color, logo_message, welcome_messages, quick_prompts, auto_display_chatbox
    } = data

    let pathLogoMessage = bot?.config_bot?.logo_message

    if (logo_message && logo_message instanceof FileUpload) {
        if (bot?.config_bot?.logo_message) {
            FileUpload.remove(bot.config_bot.logo_message)
        }
        pathLogoMessage = await logo_message.save('bot/logos')
    }

    if (favicon && favicon instanceof FileUpload) {
        if (bot.favicon) {
            FileUpload.remove(bot.favicon)
        }
        data.favicon = await data.favicon.save('bot/favicons')
    }

    bot.name = name
    bot.favicon = data.favicon
    bot.description = description
    await bot.save({ session })

    await BotConfig.findOneAndUpdate(
        {
            bot_id: bot._id,
        },
        {
            logo_message: pathLogoMessage,
            color: color,
            welcome_messages,
            quick_prompts,
            auto_display_chatbox,
        },
        {

            new: true,
            upsert: true,
            session,
        }
    )

    return bot
}

export async function handleUpdateStatus(bot, body) {
    bot.status = body.status
    await bot.save()
    return bot
}

export async function deleteBot(bot, session) {
    bot.deleted = true
    await bot.save({ session })
}

// Links
export async function getLinks(bot, query) {
    const { page, per_page, status } = query
    const keySearch = query.q || ''

    const filter = {
        bot_id: bot._id,
        ...(status && { status }),
        ...(keySearch && { url: { $regex: keySearch, $options: 'i' } }),
    }

    const links = await WebKnowledge.find(filter)
        .skip((page - 1) * per_page)
        .limit(per_page)
        .lean()
        .session(query.session)
        .select('url title description status scan_type updated_at bot_id')

    const total = await WebKnowledge.countDocuments(filter)
    return { total, per_page, page, links, bot_id: bot._id }
}

export async function createLink(currentBot, { scan_type }, infoUrl, session) {
    switch (scan_type) {
        case SCAN_TYPE.ONE:
            await handleCreateWebKnowledgeAndScanOneLink(currentBot, infoUrl, session)
            break
        case SCAN_TYPE.ALL:
            await handleScanAllLinks(infoUrl, currentBot, session)
            break
        default:
            throw new Error('Scan type is not valid')
    }
}

export async function rescanLink(currentBot, link, session) {
    const infoUrl = await handleGetInfoPage(link.url)
    const linkUpdate = await webKnowledgeService.updateKnowledgeWeb(
        {
            title: infoUrl.name,
            description: infoUrl.description,
            url_logo: infoUrl.logo,
            content: infoUrl.content,
            status: STATUS_TRAIN.TRAINED,
        },
        link,
        session
    )

    const textConvertVector = infoUrl.name + '.' + infoUrl.description + '.' + link.url
    await vectorKnowledgeService.createVectorKnowledge(
        textConvertVector,
        currentBot._id,
        link._id,
        session
    )

    const links = await handleGetAllUrlInPage(link.url)
    if (links && links.length > 0) {
        for (const link of links) {
            await webKnowledgeService.createLinkNotExist(link, currentBot._id, session)
        }
    }

    return linkUpdate
}

export async function deleteLink(bot, link, session) {
    await WebKnowledge.deleteOne({
        _id: link._id,
        bot_id: bot._id,
    }, {session})
    await vectorKnowledgeService.deleteVectorKnowledgeWithSourceId(link._id, session)
}

async function handleCreateWebKnowledgeAndScanOneLink (bot, infoUrl, session) {
    const knowledgeWeb = await webKnowledgeService.createKnowledgeWeb(
        {
            url: infoUrl.url,
            title: infoUrl.name,
            description: infoUrl.description,
            url_logo: infoUrl.logo,
            content: infoUrl.content,
        },
        bot,
        session,
        STATUS_TRAIN.TRAINED
    )

    const textConvertVector = infoUrl.name + '.' + infoUrl.description + '.' + infoUrl.url
    await vectorKnowledgeService.createVectorKnowledge(
        textConvertVector,
        bot._id,
        knowledgeWeb._id,
        session
    )
}

async function handleScanAllLinks (infoUrl, bot, session) {
    const links = await handleGetAllUrlInPage(infoUrl.url)

    if (links && links.length > 0) {
        for (const link of links) {
            const cleanedParam = link.split('?')[0]
            const convertLink = cleanedParam.endsWith('/') ? cleanedParam.slice(0, -1) : cleanedParam
            const convertUrl = infoUrl.url.endsWith('/') ? infoUrl.url.slice(0, -1) : infoUrl.url

            if (convertUrl === convertLink) {
                await handleCreateWebKnowledgeAndScanOneLink(bot, infoUrl, session)
            } else {
                await webKnowledgeService.createKnowledgeWeb({ url: link }, bot, session)
            }
        }
    }
}

export async function handleGetInfoPage(url) {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)

        const metaTags = []
        $('meta').each((_, elem) => {
            metaTags.push({
                name: $(elem).attr('name') || null,
                property: $(elem).attr('property') || null,
                content: $(elem).attr('content') || null,
            })
        })

        const rawFavicon = $('link[rel~="icon"]').attr('href') || null
        const favicon = rawFavicon ? new URL(rawFavicon, url).href : null

        const imgLogo = $('img').filter((_, img) => {
            const alt = $(img).attr('alt')?.toLowerCase() || ''
            const src = $(img).attr('src')?.toLowerCase() || ''
            return alt.includes('logo') || src.includes('logo')
        }).first().attr('src') || null

        const ogUrl = metaTags.find((tag) => tag.property === 'og:url')
        const ogTitle = metaTags.find((tag) => tag.property === 'og:title')
        const description = metaTags.find((tag) => tag.name === 'description')

        return {
            url: ogUrl?.content || url,
            name: ogTitle?.content || $('title').text() || 'Unknown Title',
            description: description?.content || '',
            logo: imgLogo,
            favicon,
            content: `<head>${$('head').html()}</head>`,
        }
    } catch (error) {
        console.error(error.message)
        return null
    }
}

export async function handleGetAllUrlInPage(url) {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)

        const origin = new URL(url).origin

        const links = $('a')
            .map((_, a) => $(a).attr('href'))
            .get()
            .filter((href) => href && !href.startsWith('tel:') && !href.startsWith('mailto:'))
            .map((href) => {
                try {
                    return new URL(href, origin).href
                } catch (e) {
                    return null
                }
            })
            .filter((href) => href && href.startsWith(origin))

        return Array.from(new Set(links))
    } catch (error) {
        console.error('Error fetching page:', error.message)
        return []
    }
}
