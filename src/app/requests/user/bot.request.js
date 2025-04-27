import Joi from 'joi'
import { AsyncValidate, FileUpload } from '@/utils/classes'
import {Bot, STATUS_BOT, WebKnowledge} from '@/models'
import {handleGetInfoPage} from '@/app/services/bot.service'
const ExcelJS = require('exceljs')
const path = require('path')

const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5

export const createBot = Joi.object({
    url: Joi.string()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const url = new URL(value)
                    const baseUrl = `${url.protocol}//${url.hostname}`
                    const bot = await Bot.findOne({
                        url: { $regex: `^${baseUrl.replace(/\/+$/, '')}`, $options: 'i' },
                        deleted: false,
                    })
                    if (!bot) {
                        req.infoUrl = await handleGetInfoPage(req.body.url)
                        if (req.infoUrl) {
                            return value
                        } else {
                            return helpers.error('any.invalid')
                        }
                    }
                    return helpers.error('any.exists')
                })
        )
        .required()
        .label('Đường dẫn'),
})

export const createBotWithFile = Joi.object({
    name: Joi.string().required().label('Tên bot'),
    description: Joi.string().required().label('Mô tả'),
    color: Joi.string().required().label('Màu sắc'),
    logo: Joi.object({
        originalname: Joi.string().trim().required().label('Tên logo'),
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng Logo'),
        buffer: Joi.binary()
            .max(MAX_UPLOAD_SIZE * 1024 ** 2)
            .required()
            .label('Logo'),
    })
        .unknown(true)
        .instance(FileUpload)
        .required()
        .label('Logo'),
    logo_message: Joi.object({
        originalname: Joi.string().trim().required().label('Tên logo nút trò chuyện'),
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng logo nút trò chuyện'),
        buffer: Joi.binary()
            .max(MAX_UPLOAD_SIZE * 1024 ** 2)
            .required()
            .label('logo nút trò chuyện'),
    })
        .unknown(true)
        .instance(FileUpload)
        .required()
        .label('Logo nút trò chuyện'),
    file: Joi.object({
        originalname: Joi.string().trim().required().label('Tên file'),
        mimetype: Joi.valid(
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
            .required()
            .label('Định dạng file'),
        buffer: Joi.binary()
            .max(MAX_UPLOAD_SIZE * 1024 ** 2)
            .required()
            .label('File'),
    })
        .required()
        .unknown(true)
        .instance(FileUpload)
        .custom(
            (value, helpers) =>
                new AsyncValidate(value,  async function (req) {
                    const workbook = new ExcelJS.Workbook()
                    await workbook.xlsx.load(value.buffer)

                    const worksheet = workbook.worksheets[0]
                    let result = ''

                    worksheet.eachRow((row) => {
                        const rowText = row.values
                            .slice(1)
                            .map(cell => (cell ? cell.toString() : ''))
                            .join('\t')
                        result += rowText + '\n'
                    })

                    if (result.trim()) {
                        req.infoFile = {
                            title: path.parse(value.originalname).name,
                            file: value,
                            content: result.trim(),
                        }

                        return value
                    } else {
                        return helpers.error('any.exists')
                    }
                })
        )
        .allow(null)
        .label('File'),
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
                    if (!link) {
                        req.infoUrl = await handleGetInfoPage(value)
                        return value
                    }
                    return helpers.error('any.exists')
                })
        )
        .required()
        .label('Đường dẫn'),
    scan_type: Joi.string().required().label('Kiểu quét'),
})

export const changeStatusBot = Joi.object({
    status: Joi.string().required().valid(...Object.values(STATUS_BOT)).label('Trạng thái'),
})
