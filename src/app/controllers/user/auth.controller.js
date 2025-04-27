import * as authService from '@/app/services/auth.service'
import {db} from '@/configs'
import {abort, getToken} from '@/utils/helpers'
import axios from 'axios'
import {FacebookService} from '@/models'

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

export async function changePassword(req, res) {
    await db.transaction(async function (session) {
        req.currentUser.password = req.body.password
        await req.currentUser.save({session})
        res.status(201).jsonify('Đổi mật khẩu thành công.')
    })
}

export async function callbackFB(req, res) {
    const { code, state } = req.query

    if (!code || !state) {
        res.redirect(`${process.env.APP_URL_CLIENT}/bot-chats/${state}/integration?status=FAIL`)
    }

    try {
        const CLIENT_ID = process.env.VITE_FB_APP_ID
        const CLIENT_SECRET = process.env.VITE_FB_SECRET_KEY
        const REDIRECT_URI = `${process.env.APP_URL_API}/auth/callback`

        const tokenResponse = await axios.get(
            'https://graph.facebook.com/v20.0/oauth/access_token',
            {
                params: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    code: code,
                },
            }
        )

        await FacebookService.findOneAndUpdate(
            { bot_id: state },
            {
                access_token: tokenResponse.data.access_token,
                bot_id: state
            },
            { upsert: true, new: true }
        )

        res.redirect(`${process.env.APP_URL_CLIENT}/bot-chats/${state}/integration`)
    } catch (error) {
        console.error('Error receiveMessageFb:', error.message)
        res.redirect(`${process.env.APP_URL_CLIENT}/bot-chats/${state}/integration?status=FAIL`)
    }
}


