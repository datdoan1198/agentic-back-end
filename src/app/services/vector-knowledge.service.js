import * as openAIService from '@/app/services/openAI.service'
import {KnowledgeVector} from '@/models'

export async function createVectorKnowledge(text, bot_id, source_id, session) {
    const vector = await openAIService.convertVector(text)

    const isKnowledgeExist = await isKnowledgeExists(vector, bot_id)

    if ( !isKnowledgeExist && vector && vector.length > 0) {
        const knowledgeVector = await KnowledgeVector.findOneAndUpdate(
            { source_id },
            {
                text, vector, source_id, bot_id
            },
            { upsert: true, new: true, session }
        )

        return knowledgeVector
    }
}

async function isKnowledgeExists(vector, bot_id) {
    const results = await KnowledgeVector.find({bot_id})

    for (const knowledgeVector of results) {
        const similarity = openAIService.cosineSimilarity(vector, knowledgeVector.vector)

        if (similarity > 0.9) {
            return true
        }
    }

    return false
}

export async function updateVectorKnowledge(text, source_id, session) {
    const vector = await openAIService.convertVector(text)

    if (vector && vector.length > 0) {
        const knowledgeVector = await KnowledgeVector.findOneAndUpdate(
            { source_id },
            {
                text, vector, source_id
            },
            { new: true, session }
        )

        return knowledgeVector
    }
}

export async function deleteVectorKnowledgeWithSourceId(source_id, session) {
    await KnowledgeVector.deleteOne({source_id}, session)
}
