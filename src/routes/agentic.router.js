import {Router} from 'express'
// import {asyncHandler} from '@/utils/helpers'
import * as aiController from '@/app/controllers/agentic.controller'

const aiRouter = Router()

aiRouter.post(
    '/',
    aiController.scrapeWebsiteInfo
)
export default aiRouter
