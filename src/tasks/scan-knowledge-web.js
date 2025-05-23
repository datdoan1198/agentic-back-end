import {CronJob} from 'cron'
import {db, logger} from '@/configs'
import {normalizeError} from '@/utils/helpers'
import {Bot, SCAN_TYPE, STATUS_TRAIN, WebKnowledge} from '@/models'
import * as webKnowledgeService from '@/app/services/knowledge.service'
import * as vectorKnowledgeService from '@/app/services/vector-knowledge.service'
import {handleGetInfoPageWithPuppeteer} from '@/app/services/bot.service'
import _ from 'lodash'

let lastRunTime = null

const scanKnowledgeWeb = CronJob.from({
    cronTime: '* * * * * *',
    onTick: async function (onComplete) {
        const currentTime = new Date()
        if (!lastRunTime || (currentTime - lastRunTime) >= 40000) {
            lastRunTime = currentTime

            try {
                const knowledgeWeb = await WebKnowledge.findOne({
                    status: STATUS_TRAIN.PENDING,
                })

                if (!_.isEmpty(knowledgeWeb)) {
                    const infoUrl = await handleGetInfoPageWithPuppeteer(knowledgeWeb.url)
                    if (!_.isEmpty(infoUrl)) {
                        await db.transaction(async function (session) {
                            const textConvertVector = infoUrl?.name + '\n' + infoUrl?.description + '\n Danh sách sản phẩm: \n' + infoUrl?.content
                            const isKnowledge = await vectorKnowledgeService.createVectorKnowledge(
                                textConvertVector, knowledgeWeb.bot_id, knowledgeWeb._id, session
                            )

                            await webKnowledgeService.updateKnowledgeWeb({
                                title: infoUrl.name,
                                description: infoUrl.description,
                                url_logo: infoUrl.logo,
                                content: infoUrl.content,
                                status: isKnowledge ? STATUS_TRAIN.TRAINED : STATUS_TRAIN.FAILED,
                            }, knowledgeWeb, session)

                            if (knowledgeWeb.scan_type === SCAN_TYPE.ALL) {
                                const links = infoUrl.links
                                const bot = await Bot.findOne({_id: knowledgeWeb.bot_id})
                                let index = 1
                                if (links && links.length > 0) {
                                    for (const link of links) {
                                        const cleanedParam = link.split('?')[0]
                                        const convertLink = cleanedParam.endsWith('/') ? cleanedParam.slice(0, -1) : cleanedParam
                                        const convertUrl = infoUrl.url.endsWith('/') ? infoUrl.url.slice(0, -1) : infoUrl.url
                                        if (convertUrl !== convertLink) {
                                            await webKnowledgeService.createKnowledgeWeb(
                                                { url: link },
                                                bot,
                                                session,
                                                index < 10 ? STATUS_TRAIN.PENDING : STATUS_TRAIN.UNTRAINED
                                            )
                                            index ++
                                        }
                                    }
                                }
                            }
                        })
                    } else {
                        await db.transaction(async function (session) {
                            await webKnowledgeService.updateKnowledgeWeb({
                                status: STATUS_TRAIN.FAILED,
                            }, knowledgeWeb, session)
                        })
                    }
                }
            } catch (error) {
                logger.error({
                    message: 'Error scan knowledge web',
                    detail: normalizeError(error),
                })
            }
        }

        if (onComplete) await onComplete()
    },
})

export default scanKnowledgeWeb

if (require.main === module) {
    db.connect().then(function () {
        scanKnowledgeWeb.onComplete = db.close
        scanKnowledgeWeb.fireOnTick()
    })
}
