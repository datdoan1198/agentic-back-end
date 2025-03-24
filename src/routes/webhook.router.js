import {Router} from 'express'
import * as webhook from '@/app/controllers/webhook.controller'

const webhookRouter = Router()

webhookRouter.get(
    '/',
    webhook.authWebhookFb
)

webhookRouter.post(
    '/',
    webhook.webhookFb
)

export default webhookRouter
