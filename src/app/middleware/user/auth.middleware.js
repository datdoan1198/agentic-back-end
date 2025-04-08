import {abort, getToken, verifyToken} from '@/utils/helpers'
import _ from 'lodash'
import {tokenBlockList} from '@/app/services/auth.service'
import {TOKEN_TYPE} from '@/configs'
import {User} from '@/models'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'

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
