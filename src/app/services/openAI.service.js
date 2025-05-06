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

export async function askOpenAI(question, bot_id, historyMessage = null, promptOrder = null) {
    try {
        const prompt = await handleGetPrompt(question, bot_id, promptOrder)

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

export async function getInfoOrder(question, order_information) {
    try {
        const messages = [
            {
                role: 'system',
                content: `Bạn là một AI giúp trích xuất thông tin đơn hàng từ tin nhắn khách hàng.
Dữ liệu đơn hàng trước đó như sau (nếu có):

${order_information}

Hãy trả lời duy nhất dưới dạng JSON object theo mẫu trên.
Nếu khách hàng nói "đặt thêm", "mua thêm", "thêm", "lấy thêm", thì hãy cộng số lượng với số lượng trong dữ liệu đơn hàng trước đó nếu cùng sản phẩm.
Nếu không tìm thấy giá trị cho một trường nào đó, hãy để trống chuỗi "" cho trường đó.
`
            },
            {
                role: 'user',
                content: question,
            },
        ]

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: 0.2,
            max_tokens: 200,
        })

        let result = completion.choices[0].message.content.trim()
        result = result.replace(/```json|```/g, '').trim()
        return JSON.parse(result)
    } catch (error) {
        console.error('Lỗi:', error.message)
        return {}
    }
}

export async function handleGetPrompt (question, bot_id, promptOrder) {
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

    return getPromptAskOpenAI(businessInfo, context, question, promptOrder)
}

export function getPromptOrder(formOrder, orderInfo) {
    const provided = []
    const missing = []

    formOrder.forEach(field => {
        const value = orderInfo[field.value]
        if (value && value.trim() !== '') {
            provided.push(`- ${field.label}: ${value.trim()}`)
        } else {
            missing.push(field.label)
        }
    })

    let result = ''
    if (provided.length > 0) {
        result += '// Hiện tại người dùng đã cung cấp:\n'
        result += provided.join('\n') + '\n\n'
    }

    if (missing.length > 0) {
        result += '// Hãy hỏi tiếp các thông tin còn thiếu để hoàn tất đặt hàng:\n'
        result += missing.map(label => `- ${label}`).join('\n')
    } else {
        result += '// Đã có đầy đủ thông tin để tiến hành đặt hàng ✅, hỏi lại khách hàng để xác nhận thông tin rồi mới đặt hàng, nếu đúng rồi thì yều câu khách hàng xác nhận thông tin, bắt khách hàng phải nhắn là xác nhận'
    }

    return result
}

export function cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    return dot / (magA * magB)
}




