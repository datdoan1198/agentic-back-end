import { SCAN_TYPE, STATUS_WEB_KNOWLEDGE, WebKnowledge } from '@/models'

export async function createKnowledgeWeb(knowledgeData, bot, session) {
    const knowledge = new WebKnowledge({
        ...knowledgeData,
        status: STATUS_WEB_KNOWLEDGE.TRAINED,
        scan_type: bot.url === knowledgeData.url ? SCAN_TYPE.ALL : SCAN_TYPE.ONE,
        bot_id: bot._id,
    })

    await knowledge.save({ session })

    return knowledge
}
