import Joi from 'joi'
import { AsyncValidate } from '@/utils/classes'
import { WebKnowledge } from '@/models'

export const createBot = Joi.object({
    url: Joi.string()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, function () {
                    return value.startsWith('https://') ? value : helpers.error('any.invalid')
                })
        )
        .required()
        .label('Đường dẫn'),
})

export const selectPageFB = Joi.object({
    page_id: Joi.string().required().label('ID fanpage'),
})

// ========== GET LINKS ========== //
export const getLinks = Joi.object({
    page: Joi.number().default(1).label('Trang'),
    per_page: Joi.number().default(10).label('Số bản ghi trên trang'),
    status: Joi.string().label('Trạng thái'),
    q: Joi.string().allow('').label('Từ khóa tìm kiếm'),
})

// ========== CREATE LINK ========== //
export const createLink = Joi.object({
    url: Joi.string()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    if (!value.startsWith('https://')) return helpers.error('any.invalid')
                    const link = await WebKnowledge.findOne({ url: value, bot_id: req.bot._id })
                    return link ? helpers.error('any.exists') : value
                })
        )
        .required()
        .label('Đường dẫn'),
    scan_type: Joi.string().required().label('Kiểu quét'),
})
