import {abort, getToken, verifyToken} from '@/utils/helpers'
import _ from 'lodash'
import {tokenBlockList} from '@/app/services/auth.service'
import {cache, TOKEN_TYPE} from '@/configs'
import {User} from '@/models'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'

export const forgotPasswordCode = cache.create('forgot-password-code')

export async function checkValidToken(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await tokenBlockList.get(token))
            if (allowedToken) {
                const {userId} = verifyToken(token, TOKEN_TYPE.USER_AUTHORIZATION)
                const user = await User.findOne({_id: userId, deleted: false})
                if (user) {
                    req.currentUser = user
                    next()
                    return
                }
            }
        }
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!')
        }
    }
    abort(401)
}

export function checkMustChangePassword(req, res, next) {
    if (!req.currentUser.must_change_password) {
        abort(409, 'Không được phép thay đổi mật khẩu lần nữa.')
    }
    req.currentUser.must_change_password = false
    next()
}

export async function checkEmailExit(req, res, next) {
    const user = await User.findOne({email: req.body.email})
    if (user) {
        req.user = user
        next()
        return
    }

    abort(404, 'Người dùng không tồn tại.')
}

export async function checkCodeForgotPassword(req, res, next) {
    const email = await forgotPasswordCode.get(req.body.code)
    const user = await User.findOne({email})
    if (user) {
        req.currentUser = user
        next()
        return
    }

    abort(404, 'Đã hết thời gian đổi mật khẩu.')
}
