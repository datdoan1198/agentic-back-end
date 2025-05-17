import Joi from 'joi'
import {AsyncValidate, FileUpload} from '@/utils/classes'
import ExcelJS from 'exceljs'
import path from 'path'
const mammoth = require('mammoth')

const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5

export const createOrUpdateFile = Joi.object({
    file: Joi.object({
        originalname: Joi.string().trim().required().label('File'),
        mimetype: Joi.valid(
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
                    const isExcel =
                        value.mimetype === 'application/vnd.ms-excel' ||
                        value.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

                    if (isExcel) {
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
                                extension : path.extname(value.originalname).toLowerCase().replace('.', ''),
                                content: result.trim(),
                            }

                            return value
                        }
                    } else {
                        const result = await mammoth.extractRawText({ buffer: value.buffer })

                        if (result.value.trim()) {
                            req.infoFile = {
                                title: path.parse(value.originalname).name,
                                file: value,
                                extension: path.extname(value.originalname).toLowerCase().replace('.', ''),
                                content: result.value.trim(),
                            }
                            return value
                        }
                    }

                    return helpers.error('any.exists')
                })
        )
        .label('File'),
})
