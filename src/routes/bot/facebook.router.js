import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'
import * as botUserController from '@/app/controllers/user/bot.controller'
import validate from '@/app/middleware/common/validate'
import * as botUserRequest from '@/app/requests/user/bot.request'

const facebookRouter = Router()

facebookRouter.get(
    '/:botId/list-page-fb',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.getPageFb)
)

facebookRouter.post(
    '/:botId/select-page-fb',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(validate(botUserRequest.selectPageFB)),
    asyncHandler(botUserController.selectPageFB)
)

facebookRouter.post(
    '/:botId/unlink-page',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(botUserController.unlinkPageFB)
)

facebookRouter.get('/fb/webhook', botUserController.verifyPageFb)

facebookRouter.post('/fb/webhook', asyncHandler(botUserController.receiveMessageFb))

export default facebookRouter
