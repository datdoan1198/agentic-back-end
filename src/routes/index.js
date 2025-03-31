import authRouter from './auth.router'
import ai from './agentic.router'
import webhook from './webhook.router'
import excelRouter from './excel.router'

function route(app) {
    app.use('/ai', ai)
    app.use('/webhook', webhook)
    app.use('/auth', authRouter)
    app.use('/excel', excelRouter)
}

export default route
