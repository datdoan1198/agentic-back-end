import Joi from 'joi'

export const chatRequest = Joi.object({
    send_message: Joi.string().required().label('Lời nhắn')
})
