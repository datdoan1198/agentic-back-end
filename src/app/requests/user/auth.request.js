import Joi from 'joi'
import {MAX_STRING_SIZE, VALIDATE_EMAIL_REGEX} from '@/configs'
import {AsyncValidate, FileUpload} from '@/utils/classes'
import moment from 'moment'
import {GENDER, User} from '@/models'

const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5

export const login = Joi.object({
    email: Joi.string().pattern(VALIDATE_EMAIL_REGEX).required().label('Email'),
    password: Joi.string().required().min(6).label('Mật khẩu'),
})

export const register = Joi.object({
    name: Joi.string().required().label('Họ và tên'),
    email: Joi.string().pattern(VALIDATE_EMAIL_REGEX).required()
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const user = await User.findOne({email: value})
                    return !user ? value : helpers.error('any.exists')
                }),
        )
        .label('Email'),
    password: Joi.string().required().min(6).label('Mật khẩu'),
})

export const updateProfile = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Họ và tên'),
    // email: Joi.string().allow('').email().required().label('Email'),
    gender: Joi.string().allow(null, '').valid(...Object.values(GENDER)).label('Giới tính'),
    dob: Joi.string()
        .trim()
        .empty(Joi.valid(null, ''))
        .default('')
        .custom(function (value, helpers) {
            if (value === null || value === '' || value === 'null') {
                return null
            }

            value = moment(value, 'DD-MM-YYYY')
            if (!value.isValid()) {
                helpers.error('string.pattern.base')
            }
            if (moment().isAfter(value, 'day')) {
                helpers.message('{{#label}} không thể lớn hơn thời điểm hiện tại.')
            }
            return value.startOf('day')
        }),
    avatar: Joi.alternatives().try(
        Joi.object({
            originalname: Joi.string().trim().required().label('Tên ảnh'),
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                .required()
                .label('Định dạng ảnh'),
            buffer: Joi.binary()
                .max(MAX_UPLOAD_SIZE * 1024 ** 2)
                .required()
                .label('Ảnh đại diện'),
        })
            .unknown(true)
            .instance(FileUpload)
            .label('Ảnh đại diện'),
        Joi.string().valid('remove').label('Xóa ảnh')
    )
        .allow('')
        .label('Ảnh đại diện'),
})

export const changePassword = Joi.object({
    password: Joi.string().required().min(6).label('Mật khẩu'),
})

