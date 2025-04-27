import {Router} from 'express'
import * as fileDetailBot from '@/app/controllers/user/bot/file.controller'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import * as botMiddleware from '@/app/middleware/user/bot.middleware'
import * as fileMiddleware from '@/app/middleware/user/file.middleware'
import validate from '@/app/middleware/common/validate'
import * as fileRequest from '@/app/requests/user/file.request'

const fileRouter = Router()

fileRouter.get(
    '/:botId/files',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botMiddleware.checkBotExist),
    asyncHandler(fileDetailBot.getListKnowledgeFiles)
)

fileRouter.post(
    '/:botId/files',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botMiddleware.checkBotExist),
    asyncHandler(validate(fileRequest.createOrUpdateFile)),
    asyncHandler(fileDetailBot.createFile)
)

fileRouter.put(
    '/:botId/files/:fileId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botMiddleware.checkBotExist),
    asyncHandler(fileMiddleware.checkFileExit),
    asyncHandler(validate(fileRequest.createOrUpdateFile)),
    asyncHandler(fileDetailBot.updateFile)
)

fileRouter.delete(
    '/:botId/files/:fileId',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(botMiddleware.checkBotExist),
    asyncHandler(fileMiddleware.checkFileExit),
    asyncHandler(fileDetailBot.deleteFile)
)

export default fileRouter
