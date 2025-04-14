import {Bot, FacebookService} from '@/models'
import {createKnowledgeWeb} from '@/app/services/knowledge.service'
const puppeteer = require('puppeteer')
import _ from 'lodash'

export async function filter(currentUser) {
    const filter = {
        user_id: currentUser._id
    }

    const botChats = await Bot.find(filter)
        .sort({created_at: 'desc'})
        .lean()

    const total = await Bot.countDocuments(filter)
    return {total, botChats}
}

export async function getDetailBot(botId) {
    const bot = await Bot.findOne({_id: botId})
    const configFb = await FacebookService.findOne({bot_id: botId})
    bot.is_connect_fb = !!configFb
    if (!_.isEmpty(configFb) && !_.isEmpty(configFb.page_access_token)) {
        bot.page = {
            id: configFb.page_id,
            name: configFb.page_name,
        }
    }
    return bot
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
                await createKnowledgeWeb({
                    url: infoUrl.url,
                    title: infoUrl.name,
                    description: infoUrl.description,
                    url_logo: infoUrl.logo,
                    content: infoUrl.content
                }, bot._id, session)
            } else {
                await createKnowledgeWeb({url: link}, bot._id, session)
            }
        }
    }

    return bot
}

export async function handleGetInfoPage (url) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    )
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const metaTags = Array.from(document.querySelectorAll('meta')).map(meta => ({
            name: meta.getAttribute('name') || null,
            property: meta.getAttribute('property') || null,
            content: meta.getAttribute('content') || null
        }))

        // eslint-disable-next-line no-undef
        const favicon = document.querySelector('link[rel~="icon"]')?.href || null

        // eslint-disable-next-line no-undef
        const imgLogo = Array.from(document.querySelectorAll('img'))
            .find(img =>
                img.src &&
                (img.alt?.toLowerCase().includes('logo') || img.src.toLowerCase().includes('logo'))
            )?.src || null

        // eslint-disable-next-line no-undef
        const headHTML = document.head.innerHTML

        return {
            url: metaTags.find(tag => tag.property === 'og:url').content,
            name: metaTags.find(tag => tag.property === 'og:title').content,
            description: metaTags.find(tag => tag.name === 'description').content,
            logo: imgLogo,
            favicon,
            content: `<head>${headHTML}</head>`
        }
    })

    await browser.close()
    return data
}

export async function handleGetAllUrlInPage (url) {
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
            .map(a => a.getAttribute('href'))
            .filter(href => href && !href.startsWith('tel:') && !href.startsWith('mailto:'))
            .map(href => {
                try {
                    // eslint-disable-next-line no-undef
                    return new URL(href, window.location.origin).href
                } catch (e) {
                    return null
                }
            })
            // eslint-disable-next-line no-undef
            .filter(href => href && href.startsWith(window.location.origin))
        return Array.from(new Set(urls))
    })

    await browser.close()
    return links
}
