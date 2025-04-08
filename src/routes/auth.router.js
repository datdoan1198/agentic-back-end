import {Router} from 'express'
import * as auth from '@/app/controllers/auth.controller'
import * as authUser from '@/app/controllers/user/auth.controller'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import validate from '@/app/middleware/common/validate'
import * as authUserRequest from '@/app/requests/user/auth.request'

const authRouter = Router()

authRouter.get(
    '/callback',
    auth.callback
)

authRouter.post(
    '/register',
    asyncHandler(validate(authUserRequest.register)),
    asyncHandler(authUser.register)
)

authRouter.post(
    '/login',
    asyncHandler(validate(authUserRequest.login)),
    asyncHandler(authUser.login)
)

authRouter.post(
    '/logout',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(authUser.logout)
)

authRouter.get(
    '/me',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(authUser.me)
)


authRouter.put(
    '/me',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(validate(authUserRequest.updateProfile)),
    asyncHandler(authUser.updateProfile)
)

export default authRouter
