import authRouter from './auth.router'
import botRouter from './bot.router'

function route(app) {
    app.use('/auth', authRouter)
    app.use('/bot', botRouter)
}

export default route
