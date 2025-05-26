import authRouter from './auth.router'
import botRouter from './bot.router'
import descriptionJobRouter from './description-job'

function route(app) {
    app.use('/auth', authRouter)
    app.use('/bots', botRouter)
    app.use('/description-jobs', descriptionJobRouter)
}

export default route
