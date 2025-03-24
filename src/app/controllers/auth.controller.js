import axios from 'axios'

export async function callback(req, res) {
    const { code } = req.query

    if (!code) {
        return res.status(400).send('Không có mã xác thực.')
    }

    try {
        const CLIENT_ID = '1162832692148543'
        const CLIENT_SECRET = '0798f14d54bfea311bbc6550ad982ebb'
        const REDIRECT_URI = 'http://localhost:3456/auth/callback'

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

        const accessToken = tokenResponse.data.access_token
        console.log('Access Token:', accessToken)
        res.redirect(`http://localhost:5173/?token=${accessToken}`)
    } catch (error) {
        res.status(500).send('Lỗi xử lý xác thực.')
    }

}
