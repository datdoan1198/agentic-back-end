import * as authService from '@/app/services/auth.service'
import {db} from '@/configs'
import {abort, getToken} from '@/utils/helpers'

export async function register(req, res) {
    await db.transaction(async function (session) {
        const result = await authService.registerUser(req.body, session)
        res.status(201).jsonify(result)
    })
}

export async function login(req, res) {
    const validLogin = await authService.checkValidLoginUser(req.body)

    if (validLogin) {
        res.jsonify(authService.authTokenUser(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await authService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await authService.profileUser(req.currentUser)
    res.jsonify(result)
}

export async function updateProfile(req, res) {
    await db.transaction(async function (session) {
        await authService.updateProfileUser(session, req.currentUser, req.body)
        res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
    })
}


