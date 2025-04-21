import {CronJob} from 'cron'
import {db, logger} from '@/configs'
import {normalizeError} from '@/utils/helpers'
import {PRIORITY_KNOWLEDGE, STATUS_WEB_KNOWLEDGE, WebKnowledge} from '@/models'
import * as knowledgeService from '@/app/services/knowledge.service'
import { handleGetInfoPage } from '@/app/services/bot.service'
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
                    status: STATUS_WEB_KNOWLEDGE.UNTRAINED
                })

                if (!_.isEmpty(knowledgeWeb)) {
                    const infoUrl = await handleGetInfoPage(knowledgeWeb.url)
                    if (!_.isEmpty(infoUrl)) {
                        await db.transaction(async function (session) {
                            await knowledgeService.updateKnowledgeWeb({
                                title: infoUrl.name,
                                description: infoUrl.description,
                                url_logo: infoUrl.logo,
                                content: infoUrl.content,
                                status: STATUS_WEB_KNOWLEDGE.TRAINED,
                            }, knowledgeWeb, session)

                            const textConvertVector = infoUrl.name + '.' + infoUrl.description
                            await knowledgeService.createVectorKnowledge(
                                textConvertVector, knowledgeWeb.bot_id, knowledgeWeb._id, PRIORITY_KNOWLEDGE.MEDIUM, session
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
