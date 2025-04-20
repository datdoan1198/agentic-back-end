import {Bot, FacebookService, PRIORITY_KNOWLEDGE, SCAN_TYPE, WebKnowledge} from '@/models'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import _ from 'lodash'
import * as knowledgeService from '@/app/services/knowledge.service'

puppeteer.use(StealthPlugin())

export async function filter(currentUser) {
    const filter = {
        user_id: currentUser._id,
    }

    const botChats = await Bot.find(filter).sort({ created_at: 'desc' }).lean()

    const total = await Bot.countDocuments(filter)
    return { total, botChats }
}

export async function getDetailBot(botId) {
    const bot = await Bot.findOne({ _id: botId })
    const configFb = await FacebookService.findOne({ bot_id: botId })
    bot.is_connect_fb = !!configFb
    if (!_.isEmpty(configFb) && !_.isEmpty(configFb.page_access_token)) {
        bot.page = {
            id: configFb.page_id,
            name: configFb.page_name,
        }
    }
    return bot
}

export async function deleteBot(currentUser, bot, session) {
    const botDelete = await Bot.findOneAndDelete({
        _id: bot._id,
        user_id: currentUser._id,
    }).session(session)
    if (!botDelete) {
        throw new Error('Bot is not exist')
    }
    await WebKnowledge.deleteMany({ bot_id: bot._id }).session(session)
    return { bot_id: bot._id }
}

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

export async function createLink(currentBot, { url, scan_type }, session) {
    switch (scan_type) {
        case SCAN_TYPE.ONE:
            await createLinkScanOne(currentBot, { url }, session)
            break
        case SCAN_TYPE.ALL:
            await createLinkScanAll(currentBot, { url }, session)
            break
        default:
            throw new Error('Scan type is not valid')
    }
}

export async function createLinkScanOne(currentBot, { url }, session) {
    const infoUrl = await handleGetInfoPage(url)
    const convertLink = url.endsWith('/') ? url.slice(0, -1) : url
    const convertUrl = infoUrl.url.endsWith('/') ? infoUrl.url.slice(0, -1) : infoUrl.url

    if (convertUrl === convertLink) {
        await knowledgeService.createKnowledgeWeb(
            {
                url: infoUrl.url,
                title: infoUrl.name,
                description: infoUrl.description,
                url_logo: infoUrl.logo,
                content: infoUrl.content,
            },
            currentBot,
            session
        )
    } else {
        await knowledgeService.createKnowledgeWeb({ url }, currentBot, session)
    }
}

export async function createLinkScanAll(currentBot, { url }, session) {
    const currentLinks = await WebKnowledge.find({
        bot_id: currentBot._id,
        url: { $regex: new RegExp(url, 'i') },
    })
        .lean()
        .session(session)
        .select('url')

    const links = await handleGetAllUrlInPage(url)
    if (links && links.length > 0) {
        await createLinkScanOne(currentBot, { url }, session)
        for (const link of links) {
            if (!currentLinks.some((currentLink) => currentLink.url === link) && link !== url) {
                await knowledgeService.createKnowledgeWeb({ url: link }, currentBot, session)
            }
        }
    }
}

export async function rescanLink(currentBot, link, session) {
    const infoUrl = await handleGetInfoPage(link.url)
    const linkUpdate = await knowledgeService.updateKnowledgeWeb({
        title: infoUrl.name,
        description: infoUrl.description,
        url_logo: infoUrl.logo,
        content: infoUrl.content,
    }, link, session)

    const textConvertVector = infoUrl.name + '.' + infoUrl.description
    await knowledgeService.createVectorKnowledge(textConvertVector, currentBot._id, link._id, PRIORITY_KNOWLEDGE.MEDIUM, session)

    const links = await handleGetAllUrlInPage(link.url)
    if (links && links.length > 0) {
        for (const link of links) {
            await knowledgeService.createLinkNotExist(link, currentBot._id, session)
        }
    }

    return linkUpdate
}

export async function deleteLink(bot, link) {
    await WebKnowledge.deleteOne({
        _id: link._id,
        bot_id: bot._id,
    })
}

export async function createBot(currentUser, infoUrl, session) {
    const bot = new Bot({
        ...infoUrl,
        user_id: currentUser._id,
    })
    await bot.save({ session })
    const links = await handleGetAllUrlInPage(infoUrl.url)

    if (links && links.length > 0) {
        for (const link of links) {
            const convertLink = link.endsWith('/') ? link.slice(0, -1) : link
            const convertUrl = infoUrl.url.endsWith('/') ? infoUrl.url.slice(0, -1) : infoUrl.url

            if (convertUrl === convertLink) {
                const knowledgeWeb = await knowledgeService.createKnowledgeWeb(
                    {
                        url: infoUrl.url,
                        title: infoUrl.name,
                        description: infoUrl.description,
                        url_logo: infoUrl.logo,
                        content: infoUrl.content,
                    },
                    bot,
                    session
                )
                const textConvertVector = infoUrl.name + '.' + infoUrl.description
                await knowledgeService.createVectorKnowledge(textConvertVector, bot._id, knowledgeWeb._id, PRIORITY_KNOWLEDGE.HIGH, session)
            } else {
                await knowledgeService.createKnowledgeWeb({ url: link }, bot, session)
            }
        }
    }

    return bot
}

export async function updateBot(currentUser, bot, data, session) {
    const botUpdate = await Bot.findOneAndUpdate(
        {
            _id: bot._id,
            user_id: currentUser._id,
        },
        {
            ...data,
        },
        { new: true, session }
    )
    if (!botUpdate) {
        throw new Error('Bot is not exist')
    }
    return botUpdate
}

export async function handleGetInfoPage(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--start-maximized'
            ]
        })
        const page = await browser.newPage()
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        )
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
        const data = await page.evaluate((pageUrl) => {
            // eslint-disable-next-line no-undef
            const metaTags = Array.from(document.querySelectorAll('meta')).map((meta) => ({
                name: meta.getAttribute('name') || null,
                property: meta.getAttribute('property') || null,
                content: meta.getAttribute('content') || null,
            }))

            // eslint-disable-next-line no-undef
            const favicon = document.querySelector('link[rel~="icon"]')?.href || null

            // eslint-disable-next-line no-undef
            const imgLogo =
                // eslint-disable-next-line no-undef
                Array.from(document.querySelectorAll('img')).find(
                    (img) => img.src && (img.alt?.toLowerCase().includes('logo') || img.src.toLowerCase().includes('logo'))
                )?.src || null

            // eslint-disable-next-line no-undef
            const headHTML = document.head.innerHTML

            const ogUrl = metaTags.find((tag) => tag.property === 'og:url')
            const ogTitle = metaTags.find((tag) => tag.property === 'og:title')
            const description = metaTags.find((tag) => tag.name === 'description')

            return {
                url: ogUrl?.content || pageUrl,
                // eslint-disable-next-line no-undef
                name: ogTitle?.content || document.title || 'Unknown Title',
                description: description?.content || '',
                logo: imgLogo,
                favicon,
                content: `<head>${headHTML}</head>`,
            }
        }, url)

        await browser.close()
        return data
    } catch (error) {
        return null
    }
}

export async function handleGetAllUrlInPage(url) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    )
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForSelector('a', { timeout: 3000 }).catch(() => {})

    const links = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const anchors = Array.from(document.querySelectorAll('a'))
        const urls = anchors
            .map((a) => a.getAttribute('href'))
            .filter((href) => href && !href.startsWith('tel:') && !href.startsWith('mailto:'))
            .map((href) => {
                try {
                    // eslint-disable-next-line no-undef
                    return new URL(href, window.location.origin).href
                } catch (e) {
                    return null
                }
            })
            // eslint-disable-next-line no-undef
            .filter((href) => href && href.startsWith(window.location.origin))
        return Array.from(new Set(urls))
    })

    await browser.close()
    return links
}
