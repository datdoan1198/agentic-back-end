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

export async function askOpenAI(question, bot_id, historyMessage = null) {
    try {
        const prompt = await handleGetPrompt(question, bot_id)

        const messages = [
            {
                role: 'system',
                content: `Bạn là một nhân viên tư vấn thân thiện của doanh nghiệp.
Bạn luôn trả lời người dùng một cách ngắn gọn, rõ ràng, thân thiện và dễ hiểu.
Luôn xưng là "mình", gọi người dùng là "bạn", và kết thúc câu bằng emoji nhẹ nhàng khi phù hợp 😊.
Chỉ trả lời dựa trên thông tin đã được cung cấp trong đoạn sau.`
            },
            ...(historyMessage || []),
            {
                role: 'user',
                content: prompt,
            },
        ]

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: 0.4,
            max_tokens: 500,
        })

        return completion.choices[0].message.content.trim()
    } catch (error) {
        console.log(error.message)
        return 'Xin lỗi mình sẽ quay lại sau!'
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
            .slice(0, 10)

        const topTexts = ranked.map(item => item.knowledgeVector.text).filter(Boolean)
        context += topTexts.join('\n---\n')
    }

    return getPromptAskOpenAI(businessInfo, context, question)
}

export function cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    return dot / (magA * magB)
}




