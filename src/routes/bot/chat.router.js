import { Router } from 'express'
import * as botUserController from '@/app/controllers/user/bot.controller'
import * as chatController from '@/app/controllers/user/chat.controller'
import { asyncHandler } from '@/utils/helpers'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import * as conversationMiddleware from '@/app/middleware/user/conversation.middleware'
import validate from '@/app/middleware/common/validate'
import * as chatRequest from '@/app/requests/user/chat.request'
import * as conversationController from '@/app/controllers/user/conversation.controller'

const chatRouter = Router()

chatRouter.get(
    '/:botId/chat',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.getDetailBot)
)

chatRouter.post(
    '/:botId/chat',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(conversationMiddleware.checkConversationWithChat),
    asyncHandler(validate(chatRequest.chatRequest)),
    asyncHandler(chatController.create)
)


chatRouter.get(
    '/:botId/conversation/:conversationId/messages',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(conversationMiddleware.checkConversationExit),
    asyncHandler(conversationController.getAllListMessageOfConversation)
)

export default chatRouter
