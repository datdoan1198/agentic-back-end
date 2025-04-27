import { Router } from 'express'
import * as botUserController from '@/app/controllers/user/bot.controller'
import * as fileController from '@/app/controllers/user/bot/file.controller'
import { asyncHandler } from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import validate from '@/app/middleware/common/validate'
import * as botUserRequest from '@/app/requests/user/bot.request'
import conversationRouter from './bot/conversation.route'
import facebookRouter from './bot/facebook.router'
import linkRouter from './bot/link.router'
import chatRouter from './bot/chat.router'
import fileRouter from './bot/file.router'

const botRouter = Router()

botRouter.get(
    '/',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserController.getListBotChats)
)

botRouter.post(
    '/',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(validate(botUserRequest.createBot)),
    asyncHandler(botUserController.create)
)

botRouter.post(
    '/create-with-file',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(validate(botUserRequest.createBotWithFile)),
    asyncHandler(fileController.createBotWithFile)
)

botRouter.get(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.getDetailBot)
)

botRouter.put(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserMiddleware.parseFormData),
    asyncHandler(validate(botUserRequest.updateBot)),
    asyncHandler(botUserController.updateBot)
)

botRouter.put(
    '/:botId/change-status',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.changeStatusBot)),
    asyncHandler(botUserController.updateStatus)
)

botRouter.delete(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.deleteBot)
)

botRouter.use('/', linkRouter)
botRouter.use('/', facebookRouter)
botRouter.use('/', conversationRouter)
botRouter.use('/', chatRouter)
botRouter.use('/', fileRouter)

export default botRouter
