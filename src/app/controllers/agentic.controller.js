import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())


export async function scrapeWebsiteInfo(req, res) {
    const url = 'https://www.coolmate.me/'

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3')

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

        const metadata = await page.evaluate(() => {
            return {
                // eslint-disable-next-line no-undef
                title: document.title || '',
                // eslint-disable-next-line no-undef
                description: document.querySelector('meta[name="description"]')?.content || '',
                // eslint-disable-next-line no-undef
                keywords: document.querySelector('meta[name="keywords"]')?.content || '',
            }
        })

        const products = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return Array.from(document.querySelectorAll('h2, h3, .product-title, .item-title, .product-name'))
                .map(el => el.textContent.trim())
                .filter(name => name.length > 3)
        })

        const images = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.startsWith('http'))
        })

        const categories = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return Array.from(document.querySelectorAll('nav a, .menu a, .category a'))
                .map(link => link.textContent.trim())
                .filter(text => text.length > 2)
        })

        await browser.close()

        res.json({
            success: true,
            metadata,
            products: [...new Set(products)].slice(0, 10), // Lọc trùng & giới hạn kết quả
            images: [...new Set(images)].slice(0, 10),
            categories: [...new Set(categories)].slice(0, 10),
        })
    } catch (error) {
        await browser.close()
        res.status(500).json({ error: error.message })
    }
}

export async function demoLink(req, res) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3')
    await page.goto('http://thegioididong.com/', { waitUntil: 'networkidle2' })

    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0
            const distance = 100
            const timer = setInterval(() => {
                // eslint-disable-next-line no-undef
                const scrollHeight = document.body.scrollHeight
                // eslint-disable-next-line no-undef
                window.scrollBy(0, distance)
                totalHeight += distance

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, 200)
        })
    })

    await page.waitForSelector('a', { timeout: 3000 })

    const links = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        return Array.from(document.querySelectorAll('a'))
            // eslint-disable-next-line no-undef
            .map(link => link.href.startsWith('/') ? window.location.origin + link.href : link.href)
            .filter(href => href.startsWith('http'))
    })

    await browser.close()
    res.jsonify(links)
}
