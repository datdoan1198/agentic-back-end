import {Router} from 'express'
import * as conversationUser from '@/app/controllers/user/conversation.controller'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import * as conversationMiddleware from '@/app/middleware/user/conversation.middleware'

const conversationRouter = Router()

conversationRouter.get(
    '/:botId/conversations',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(conversationUser.getListConversation)
)

conversationRouter.get(
    '/:botId/conversations/:conversationId/messages',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserMiddleware.checkConversationExist),
    asyncHandler(conversationUser.getListMessageOfConversation)
)

conversationRouter.get(
    '/:botId/conversations/:conversationId/messages',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(conversationMiddleware.checkConversationExit),
    asyncHandler(conversationUser.getAllListMessageOfConversation)
)

export default conversationRouter
