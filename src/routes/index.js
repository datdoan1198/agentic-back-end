import authRouter from './auth.router'
import botRouter from './bot.router'

function route(app) {
    app.use('/auth', authRouter)
    app.use('/bots', botRouter)
}

export default route
