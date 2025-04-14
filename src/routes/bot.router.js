import {Router} from 'express'
import * as botUser from '@/app/controllers/user/bot.controller'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import validate from '@/app/middleware/common/validate'
import * as botUserRequest from '@/app/requests/user/bot.request'

const botRouter = Router()

botRouter.get(
    '/',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUser.getListBotChats),
)

botRouter.post(
    '/',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(validate(botUserRequest.createBot)),
    asyncHandler(botUserMiddleware.checkUrlBotExist),
    asyncHandler(botUser.create),
)

botRouter.get(
    '/:botId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUser.getDetailBot),
)

botRouter.get(
    '/:botId/list-page-fb',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUser.getPageFb),
)

botRouter.post(
    '/:botId/select-page-fb',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.selectPageFB)),
    asyncHandler(botUser.selectPageFB),
)

botRouter.get(
    '/fb/webhook',
    botUser.verifyPageFb,
)

botRouter.post(
    '/fb/webhook',
    asyncHandler(botUser.receiveMessageFb),
)

botRouter.get(
    '/openId/demo-openId',
    botUser.demo,
)

export default botRouter
