import Joi from 'joi'
import { AsyncValidate, FileUpload } from '@/utils/classes'
import {STATUS_BOT, WebKnowledge} from '@/models'

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

export const updateBot = Joi.object({
    name: Joi.string().label('Tên bot'),
    favicon: Joi.alternatives()
        .try(
            Joi.string(),
            Joi.object({
                mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                    .required()
                    .label('Image format'),
            })
                .unknown(true)
                .instance(FileUpload)
        )
        .allow('', {}, 'null')
        .label('Favicon'),
    logo_message: Joi.alternatives()
        .try(
            Joi.string(),
            Joi.object({
                mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                    .required()
                    .label('Image format'),
            })
                .unknown(true)
                .instance(FileUpload)
        )
        .allow('', {}, 'null')
        .label('Logo nút nói chuyện'),
    color: Joi.string().label('Màu sắc'),
    description: Joi.string().label('Mô tả'),
    welcome_messages: Joi.array().items(Joi.string()).label('Tin nhắn chào mừng'),
    quick_prompts: Joi.array().items(Joi.string()).label('Câu hỏi nhanh'),
    auto_display_chatbox: Joi.string().label('Tự động hiển thị hộp chat'),
})

export const selectPageFB = Joi.object({
    page_id: Joi.string().required().label('ID fanpage'),
})

export const getLinks = Joi.object({
    page: Joi.number().default(1).label('Trang'),
    per_page: Joi.number().default(10).label('Số bản ghi trên trang'),
    status: Joi.string().label('Trạng thái'),
    q: Joi.string().allow('').label('Từ khóa tìm kiếm'),
})

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

export const changeStatusBot = Joi.object({
    status: Joi.string().required().valid(...Object.values(STATUS_BOT)).label('Trạng thái'),
})
