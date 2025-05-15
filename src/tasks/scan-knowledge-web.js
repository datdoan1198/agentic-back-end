import {CronJob} from 'cron'
import {db, logger} from '@/configs'
import {normalizeError} from '@/utils/helpers'
import {STATUS_TRAIN, WebKnowledge} from '@/models'
import * as webKnowledgeService from '@/app/services/knowledge.service'
import * as vectorKnowledgeService from '@/app/services/vector-knowledge.service'
import {handleGetInfoPageWithPuppeteer} from '@/app/services/bot.service'
import _ from 'lodash'

let lastRunTime = null

const scanKnowledgeWeb = CronJob.from({
    cronTime: '* * * * * *',
    onTick: async function (onComplete) {
        const currentTime = new Date()
        if (!lastRunTime || (currentTime - lastRunTime) >= 20000) {
            lastRunTime = currentTime

            try {
                const knowledgeWeb = await WebKnowledge.findOne({
                    status: STATUS_TRAIN.UNTRAINED
                })

                if (!_.isEmpty(knowledgeWeb)) {
                    const infoUrl = await handleGetInfoPageWithPuppeteer(knowledgeWeb.url)
                    if (!_.isEmpty(infoUrl)) {
                        await db.transaction(async function (session) {
                            await webKnowledgeService.updateKnowledgeWeb({
                                title: infoUrl.name,
                                description: infoUrl.description,
                                url_logo: infoUrl.logo,
                                content: infoUrl.content,
                                status: STATUS_TRAIN.TRAINED,
                            }, knowledgeWeb, session)

                            const textConvertVector = infoUrl.name + '.' + infoUrl.description + '.' + knowledgeWeb.url
                            await vectorKnowledgeService.createVectorKnowledge(
                                textConvertVector, knowledgeWeb.bot_id, knowledgeWeb._id, session
                            )
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
