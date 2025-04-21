import OpenAI from 'openai'
import {Bot, KnowledgeVector} from '@/models'
import {getPromptAskOpenAI} from '@/utils/helpers/promp.helper'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function convertVector(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        })

        return response.data[0].embedding
    } catch (error) {
        return []
    }
}

export async function askOpenAI(question, bot_id) {
    try {
        const prompt = await handleGetPrompt(question, bot_id)

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là một trợ lý AI trả lời ngắn gọn, dựa trên tri thức được cung cấp.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.4,
            max_tokens: 500,
        })

        return completion.choices[0].message.content.trim()
    } catch (error) {
        return ''
    }
}

export async function handleGetPrompt (question, bot_id) {
    const queryEmbedding = await convertVector(question)
    const bot = await Bot.findOne({_id: bot_id, deleted: false,})
    let context = ''
    let businessInfo = ''

    if (bot) {
        businessInfo += bot.name
    }

    const results = await KnowledgeVector.find({bot_id})

    if (results && results.length > 0) {
        const ranked = results
            .map((knowledgeVector) => ({
                knowledgeVector,
                similarity: cosineSimilarity(queryEmbedding, knowledgeVector.vector)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3)

        const topTexts = ranked.map(item => item.knowledgeVector.text).filter(Boolean)
        context += topTexts.join('\n---\n')
    }

    return getPromptAskOpenAI(businessInfo, context, question)
}

function cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    return dot / (magA * magB)
}




