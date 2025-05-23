import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import * as linkUserMiddleware from '@/app/middleware/user/link.middleware'
import validate from '@/app/middleware/common/validate'
import * as botUserRequest from '@/app/requests/user/bot.request'
import * as botUserController from '@/app/controllers/user/bot.controller'

const linkRouter = Router()

linkRouter.get(
    '/:botId/links',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.getLinks)),
    asyncHandler(botUserController.getLinks)
)

linkRouter.post(
    '/:botId/links',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.createLink)),
    asyncHandler(botUserController.createLink)
)

linkRouter.get(
    '/:botId/links/:linkId/content',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserMiddleware.checkLinkExist),
    botUserController.viewLinkContent
)

linkRouter.post(
    '/:botId/links/:linkId/re-scan',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(linkUserMiddleware.checkNumberOfLink),
    asyncHandler(botUserMiddleware.checkLinkExist),
    asyncHandler(botUserController.rescanLink)
)

linkRouter.delete(
    '/:botId/links/:linkId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserMiddleware.checkLinkExist),
    asyncHandler(botUserController.deleteLink)
)

export default linkRouter
