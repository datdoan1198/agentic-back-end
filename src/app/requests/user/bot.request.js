import Joi from 'joi'
import {AsyncValidate} from '@/utils/classes'

export const createBot = Joi.object({
    url: Joi.string()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, function () {
                    return value.startsWith('https://') ? value : helpers.error('any.invalid')
                }),
        )
        .required()
        .label('Đường dẫn')
})

export const selectPageFB = Joi.object({
    page_id: Joi.string().required().label('ID fanpage')
})
