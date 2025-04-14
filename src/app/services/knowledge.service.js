import {WebKnowledge} from '@/models'

export async function createKnowledgeWeb(knowledgeData, bot_id, session) {
    const knowledge = new WebKnowledge({
        ...knowledgeData, bot_id
    })

    await knowledge.save({ session })

    return true
}

