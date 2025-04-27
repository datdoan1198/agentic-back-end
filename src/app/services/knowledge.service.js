import {SCAN_TYPE, STATUS_TRAIN, WebKnowledge} from '@/models'

export async function createKnowledgeWeb(
    knowledgeData, bot, session, status = STATUS_TRAIN.UNTRAINED, scan_type = SCAN_TYPE.ONE
) {
    const isWebKnowledgeExit = await WebKnowledge.findOne({url: knowledgeData.url})
    if (!isWebKnowledgeExit) {
        const knowledge = new WebKnowledge({
            ...knowledgeData,
            status,
            scan_type,
            bot_id: bot._id,
        })

        await knowledge.save({ session })

        return knowledge
    }

    return isWebKnowledgeExit
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
                status: STATUS_TRAIN.UNTRAINED,
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
