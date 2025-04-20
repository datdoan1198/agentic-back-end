import {KnowledgeVector, PRIORITY_KNOWLEDGE, SCAN_TYPE, STATUS_WEB_KNOWLEDGE, WebKnowledge} from '@/models'
import * as openAIService from '@/app/services/openAI.service'

export async function createKnowledgeWeb(knowledgeData, bot, session, scan_type = SCAN_TYPE.ONE,) {
    const knowledge = new WebKnowledge({
        ...knowledgeData,
        status: STATUS_WEB_KNOWLEDGE.TRAINED,
        scan_type,
        bot_id: bot._id,
    })

    await knowledge.save({ session })

    return knowledge
}

export async function updateKnowledgeWeb(knowledgeData, link, session) {
    const knowledge = await WebKnowledge.findOneAndUpdate(
        { _id: link._id },
        {
            ...knowledgeData,
        },
        {
            new: true,
            session: session
        }
    )

    return knowledge
}

export async function createLinkNotExist(url, bot_id, session) {
    await WebKnowledge.findOneAndUpdate(
        { url: url },
        {
            $setOnInsert: {
                url,
                status: STATUS_WEB_KNOWLEDGE.UNTRAINED,
                scan_type: SCAN_TYPE.ONE,
                bot_id,
            }
        },
        {
            upsert: true,
            new: true,
            session: session
        }
    )
}

export async function createVectorKnowledge(text, bot_id, source_id, priority = PRIORITY_KNOWLEDGE.MEDIUM, session) {
    const vector = await openAIService.convertVector(text)

    if (vector && vector.length > 0) {
        const knowledgeVector = new KnowledgeVector({
            text, vector, source_id, bot_id, priority
        })

        await knowledgeVector.save({ session })

        return knowledgeVector
    }
}
