import {Router} from 'express'
import * as authUser from '@/app/controllers/user/auth.controller'
import {asyncHandler} from '@/utils/helpers'
import * as authUserMiddleware from '@/app/middleware/user/auth.middleware'
import validate from '@/app/middleware/common/validate'
import * as authUserRequest from '@/app/requests/user/auth.request'
import {changePassword} from '@/app/controllers/user/auth.controller'

const authRouter = Router()

authRouter.get(
    '/callback',
    authUser.callbackFB
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

authRouter.put(
    '/change-password',
    asyncHandler(authUserMiddleware.checkValidToken),
    asyncHandler(validate(authUserRequest.changePassword)),
    asyncHandler(authUser.changePassword)
)

authRouter.post(
    '/forgot-password',
    asyncHandler(validate(authUserRequest.forgotPassword)),
    asyncHandler(authUserMiddleware.checkEmailExit),
    asyncHandler(authUser.forgotPassword)
)

authRouter.put(
    '/reset-password',
    asyncHandler(validate(authUserRequest.resetPassword)),
    asyncHandler(authUserMiddleware.checkCodeForgotPassword),
    asyncHandler(authUser.changePassword)
)

export default authRouter
