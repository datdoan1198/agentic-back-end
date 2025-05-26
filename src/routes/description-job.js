import { Router } from 'express'
import * as descriptionJobUserController from '@/app/controllers/user/description-job.controller'
import { asyncHandler } from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'

const descriptionJobRouter = Router()

descriptionJobRouter.get(
    '/',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(descriptionJobUserController.getListBotChats)
)

export default descriptionJobRouter
