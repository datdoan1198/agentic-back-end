import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as dashboardUserController from '@/app/controllers/user/bot/dashboard.controller'
import * as botUserMiddleware from '@/app/middleware/user/bot.middleware'

const dashboardRouter = Router()

dashboardRouter.get(
    '/:botId/dashboard/general-statistics',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(dashboardUserController.getGeneralStatistics)
)

dashboardRouter.get(
    '/:botId/dashboard/total-message-by-day',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(dashboardUserController.getTotalMessageByDay)
)

dashboardRouter.get(
    '/:botId/dashboard/latest-message',
    asyncHandler(botUserMiddleware.checkBotExist),
    asyncHandler(dashboardUserController.getLatestMessage)
)

export default dashboardRouter
