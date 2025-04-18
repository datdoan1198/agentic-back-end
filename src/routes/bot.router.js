import { Router } from 'express'
import * as botUserController from '@/app/controllers/user/bot.controller'
import { asyncHandler } from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import validate from '@/app/middleware/common/validate'
import * as botUserRequest from '@/app/requests/user/bot.request'

const botRouter = Router()

botRouter.get(
    '/:botId/links',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.getLinks)),
    asyncHandler(botUserController.getLinks)
)

botRouter.post(
    '/:botId/links',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.createLink)),
    asyncHandler(botUserController.createLink)
)

botRouter.get(
    '/:botId/links/:linkId/content',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.viewLinkContent)
)

botRouter.get(
    '/:botId/links/:linkId/re-scan',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.rescanLink)
)

botRouter.delete(
    '/:botId/links/:linkId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.deleteLink)
)

botRouter.get(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.getDetailBot)
)

botRouter.get(
    '/:botId/list-page-fb',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.getPageFb)
)

botRouter.post(
    '/:botId/select-page-fb',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.selectPageFB)),
    asyncHandler(botUserController.selectPageFB)
)

botRouter.get('/fb/webhook', botUserController.verifyPageFb)

botRouter.post('/fb/webhook', asyncHandler(botUserController.receiveMessageFb))

botRouter.get('/openId/demo-openId', botUserController.demo)

botRouter.get('/', asyncHandler(authUserMiddleware.checkValidToken), asyncHandler(botUserController.getListBotChats))

botRouter.post(
    '/',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(validate(botUserRequest.createBot)),
    asyncHandler(botUserMiddleware.checkUrlBotExist),
    asyncHandler(botUserController.create)
)

botRouter.put(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserMiddleware.parseFormData),
    asyncHandler(validate(botUserRequest.updateBot)),
    asyncHandler(botUserController.updateBot)
)

botRouter.delete(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.deleteBot)
)

export default botRouter
