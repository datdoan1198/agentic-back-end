import {Router} from 'express'
import * as auth from '@/app/controllers/auth.controller'

const authRouter = Router()

authRouter.get(
    '/callback',
    auth.callback
)

export default authRouter
