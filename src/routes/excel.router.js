import {Router} from 'express'
import * as excel from '@/app/controllers/excel.controller'

const authRouter = Router()

authRouter.post(
    '/',
    excel.exportExcel
)

export default authRouter
