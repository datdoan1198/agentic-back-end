import authRouter from './auth.router'
import botRouter from './bot.router'
import socketRouter from './socket.router'

function route(app, io) {
    socketRouter(io)
    app.use((req, res, next) => {
        req.io = io
        next()
    })

    app.use('/auth', authRouter)
    app.use('/bots', botRouter)
}

export default route
