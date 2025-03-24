import authRouter from './auth.router'
import ai from './agentic.router'
import webhook from './webhook.router'

function route(app) {
    app.use('/ai', ai)
    app.use('/webhook', webhook)
    app.use('/auth', authRouter)
}

export default route
