const PAGE_ACCESS_TOKEN = 'EAAQhlxWMeT8BO6B9OBbgyHztN3iT7oZCUIUZACPn6mDRApUj7nO9OkA6YRNGd1GO1FdpFfjGE7wg5TXlm66cxFj2Q3ZA0BJ2osByRsy5eNbdrDgoVQgFenu9qUADELl4VzlJeDlbAQZCwSNSdqcrkXDK5Kknj2GDWweQKXaqsPiiPd6qke0QkS9MoqVRUBpV'

export function authWebhookFb(req, res) {
    const VERIFY_TOKEN = PAGE_ACCESS_TOKEN

    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK ĐÃ XÁC MINH!')
        console.log(VERIFY_TOKEN)
        res.status(200).send(challenge)
    } else {
        res.sendStatus(403)
    }
}

export function webhookFb(req, res) {
    const body = req.body

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.sender) {
                    const senderId = event.sender.id
                    const userMessage = event.message.text

                    console.log(`📩 Người dùng ${senderId} gửi tin nhắn: ${userMessage}`)

                    // Tự động phản hồi khách hàng
                    sendMessage(senderId, 'Xin chào! Cảm ơn bạn đã nhắn tin cho chúng tôi. 😊')
                }
            })
        })

        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
}

const sendMessage = async (recipientId, message) => {
    await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
        }),
    })
}
