import * as openAIService from './openAI.service'
import * as conversationService from './conversation.service'

export async function sendMessage(userId, requestBody, io, socketId, session) {
    // Tạo mới conversation nếu chưa có
    if (!requestBody.conversation_id) {
        const conversation = await conversationService.createWebConversation({ botId: bot_id }, session)
        // Lưu lại conversation_id vào requestBody
        requestBody.conversation_id = conversation._id
    }
    const { conversation_id, bot_id, content } = requestBody

    // Tổng hợp tri thức và lấy phản hồi từ OpenAI
    const botContent = await openAIService.askOpenAI(content, bot_id)

    // Lưu tin nhắn vào Database
    const botMessage = await conversationService.saveMessage(
        userId,
        conversation_id,
        content,
        botContent,
        bot_id,
        session
    )

    // Cập nhật last_message cho conversation
    await conversationService.updateLastMessage(conversation_id, botMessage, session)
    // Emit sự kiện trở lại cho client
    io.to(socketId).emit('message', botMessage)
}
