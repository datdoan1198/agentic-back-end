
export function getPromptAskOpenAI(business, context, userQuestion) {
    return `
        Bạn là nhân viên bán hàng cho "${business}". Dưới đây là tri thức có liên quan:
        
        "${context}"
        
        Câu hỏi: "${userQuestion}"
        
        Hãy trả lời ngắn gọn và chính xác dựa trên thông tin trên.
    `
}
