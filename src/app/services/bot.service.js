import {Bot, FacebookService, OrderConfig, SCAN_TYPE, STATUS_ORDER, STATUS_TRAIN, WebKnowledge} from '@/models'
import _ from 'lodash'
import * as vectorKnowledgeService from '@/app/services/vector-knowledge.service'
import * as webKnowledgeService from '@/app/services/knowledge.service'
import {FileUpload} from '@/utils/classes'
import {createFile} from '@/app/services/file-knowledge.service'
import BusinessConfig from '../../models/business-config'
import * as openAIService from '@/app/services/openAI.service'
import {APP_ENV, NODE_ENV} from '@/configs'
const puppeteer = require('puppeteer')

export async function filter(currentUser) {
    const filter = {
        user_id: currentUser._id,
        deleted: false,
    }

    const bots = await Bot.find(filter).populate('business').sort({ created_at: 'desc' }).lean()
    const botChats = bots.map((bot) => {
        if (bot.logo) {
            bot.logo = FileUpload.in(bot.logo)
        }
        if (bot.business) {
            bot.business.logo = FileUpload.in(bot.business.logo)
        }
        return bot
    })

    const total = await Bot.countDocuments(filter)
    return { total, botChats }
}

export async function getDetailBot(botId) {
    const bot = await Bot.findOne({ _id: botId, deleted: false }).populate('business').populate('order_config')
    const configFb = await FacebookService.findOne({ bot_id: botId })
    bot.is_connect_fb = !!configFb
    if (!_.isEmpty(configFb) && !_.isEmpty(configFb.page_access_token)) {
        bot.page = {
            id: configFb.page_id,
            name: configFb.page_name,
        }
    }
    if (bot.logo_message) {
        bot.logo_message = FileUpload.in(bot.logo_message)
    }
    if (bot.business) {
        bot.business.logo = FileUpload.in(bot.business.logo)
    }
    return bot
}

export async function createBot(currentUser, infoUrl, infoFile, body, session) {
    const {
        name, description, logo_message, color,
        name_business, logo,
    } = body

    let pathLogoMessage = ''
    if (logo_message && logo_message instanceof FileUpload) {
        pathLogoMessage = await logo_message.save('bot/logos')
    }
    const bot = new Bot({
        name, description, logo_message: pathLogoMessage, color,
        user_id: currentUser._id,
    })
    await bot.save({ session })

    await logo.save('bot/logos')
    const businessConfig = new BusinessConfig({
        name: name_business,
        logo,
        bot_id: bot._id
    })
    await businessConfig.save({ session })

    infoUrl && infoUrl.url && await handleCreateWebKnowledgeAndScanOneLink(
        bot, infoUrl, session, STATUS_TRAIN.PENDING, SCAN_TYPE.ALL
    )
    infoFile && await createFile(infoFile, bot, session)
    return bot
}

export async function updateBot(currentUser, bot, data, session) {
    const {
        name,   description, color, logo_message, is_order, form_order,
        logo, name_business
    } = data

    let pathLogoMessage = bot.logo_message
    if (logo_message && logo_message instanceof FileUpload) {
        if (bot.logo_message) {
            FileUpload.remove(bot.logo_message)
        }
        pathLogoMessage = await logo_message.save('bot/logos')
    }

    let pathLogo = bot?.business?.logo
    if (logo && logo instanceof FileUpload) {
        if (bot?.business?.logo) {
            FileUpload.remove(bot.business.logo)
        }
        pathLogo = await logo.save('bot/logos')
    }

    bot.name = name
    bot.logo_message = pathLogoMessage
    bot.description = description
    bot.color = color
    bot.is_order = is_order
    await bot.save({ session })

    await BusinessConfig.findOneAndUpdate(
        { bot_id: bot._id },
        {
            name: name_business,
            logo: pathLogo
        },
        {new: true, session,}
    )

    if (is_order === STATUS_ORDER.ACTIVE) {
        await OrderConfig.findOneAndUpdate(
            { bot_id: bot._id },
            {
                $set: { form_order },
                $setOnInsert: {bot_id: bot._id}
            },
            { upsert: true, new: true, session }
        )
    }

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
            await handleCreateWebKnowledgeAndScanOneLink(currentBot, infoUrl, session, STATUS_TRAIN.PENDING)
            break
        case SCAN_TYPE.ALL:
            await handleScanAllLinks(infoUrl, currentBot, session)
            break
        default:
            throw new Error('Scan type is not valid')
    }
}

export async function rescanLink(currentBot, link, session) {
    const infoUrl = await handleGetInfoPageWithPuppeteer(link.url)
    const textConvertVector = infoUrl.name + '\n' + infoUrl.description + '\n Danh sách sản phẩm: \n' + infoUrl.content
    const isKnowledge = await vectorKnowledgeService.createVectorKnowledge(
        textConvertVector,
        currentBot._id,
        link._id,
        session
    )

    const linkUpdate = await webKnowledgeService.updateKnowledgeWeb(
        {
            title: infoUrl.name,
            description: infoUrl.description,
            url_logo: infoUrl.logo,
            content: infoUrl.content,
            status: isKnowledge ? STATUS_TRAIN.TRAINED : STATUS_TRAIN.FAILED,
        },
        link,
        session
    )

    return linkUpdate
}

export async function deleteLink(bot, link, session) {
    await WebKnowledge.deleteOne({
        _id: link._id,
        bot_id: bot._id,
    }, {session})
    await vectorKnowledgeService.deleteVectorKnowledgeWithSourceId(link._id, session)
}

async function handleCreateWebKnowledgeAndScanOneLink (
    bot, infoUrl, session, status = STATUS_TRAIN.UNTRAINED, scan_type = SCAN_TYPE.ONE
) {
    await webKnowledgeService.createKnowledgeWeb(
        {
            url: infoUrl.url,
            title: infoUrl.name,
            description: infoUrl.description,
            url_logo: infoUrl.logo,
            content: infoUrl.content,
        },
        bot,
        session,
        status,
        scan_type
    )
}

async function handleScanAllLinks (infoUrl, bot, session) {
    const links = infoUrl.links

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

export async function handleGetInfoPageWithPuppeteer(url) {
    try {
        const option = {
            ...NODE_ENV === APP_ENV.PRODUCTION && {executablePath: '/usr/bin/chromium-browser'},
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
        const browser = await puppeteer.launch(option)
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' })

        const metaTags = await page.evaluate(() => {
            const tags = []
            // eslint-disable-next-line no-undef
            const metaElems = document.querySelectorAll('meta')
            metaElems.forEach((elem) => {
                tags.push({
                    name: elem.getAttribute('name') || null,
                    property: elem.getAttribute('property') || null,
                    content: elem.getAttribute('content') || null,
                })
            })
            return tags
        })

        let favicon = null
        const faviconElem = await page.$('link[rel~="icon"]')
        if (faviconElem) {
            const rawFavicon = await page.evaluate(link => link.href, faviconElem)
            favicon = new URL(rawFavicon, url).href
        }

        let imgLogo = null
        const logoElem = await page.$('img[alt*="logo"], img[src*="logo"]')
        if (logoElem) {
            imgLogo = await page.evaluate(img => img.src, logoElem)
        }

        const ogUrl = metaTags.find((tag) => tag.property === 'og:url')
        const ogTitle = metaTags.find((tag) => tag.property === 'og:title')
        const description = metaTags.find((tag) => tag.name === 'description')

        const fullText = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return document.body.innerText.trim()
        })

        // const bodyHtml = await page.evaluate(() => {
        //     // eslint-disable-next-line no-undef
        //     return `<body>${document.body.innerHTML}</body>`
        // })

        const links = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            const anchorElements = Array.from(document.querySelectorAll('a[href]'))
            const urls = anchorElements
                .map(a => a.href.trim())
                .filter(href =>
                    href &&
                    href !== '#' &&
                    !href.startsWith('javascript:') &&
                    (href.startsWith('http://') || href.startsWith('https://'))
                )
            return Array.from(new Set(urls))
        })

        await browser.close()

        return {
            url: ogUrl?.content || url,
            name: ogTitle?.content || (await page.title()) || 'Unknown Title',
            description: description?.content || '',
            logo: imgLogo,
            favicon,
            content: await openAIService.summaryWeb(fullText),
            links: links
        }
    } catch (error) {
        console.error(error.message)
        return null
    }
}
