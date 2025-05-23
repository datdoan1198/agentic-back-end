import mongoose from 'mongoose'

export default function createModel(name, collection, definition, options) {
    const schema = new mongoose.Schema(definition, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false,
        id: false,
        toJSON: { getters: true, virtuals: true },
        ...(options ?? {}),
    })

    return mongoose.model(name, schema, collection)
}

export const { ObjectId } = mongoose.Types

export const ROLE = {
    SUPER_ADMIN: 'super-admin',
}

export const PERMISSION = {
    SUPER_ADMIN: 'super-admin',
    // Role management
    LIST_ROLE: 'list-role',
    CREATE_ROLE: 'create-role',
    UPDATE_ROLE: 'update-role',
    DELETE_ROLE: 'delete-role',

    // Permission management
    UPDATE_PERMISSION_FOR_ROLE: 'update-permission-for-role',
}

export const USER_PERMISSION = {
    // Club management
    REMOVE_MEMBER: 'remove-member',
    ACCEPT_MEMBER: 'accept-member',
}

export const USER_ROLE = {
    MANAGER: 'club-manager',
    CENSOR: 'club-censor',
}

export const STATUS_ACCOUNT = {
    ACTIVE: 'ACTIVE',
    DE_ACTIVE: 'DE_ACTIVE',
}

export const STATUS_BOT = {
    ACTIVE: 'ACTIVE',
    DE_ACTIVE: 'DE_ACTIVE',
}

export const STATUS_ORDER = {
    ACTIVE: 'ACTIVE',
    DE_ACTIVE: 'DE_ACTIVE',
}

export const GENDER = {
    FEMALE: 'FEMALE',
    MALE: 'MALE',
}

export const STATUS_TRAIN = {
    TRAINED: 'TRAINED',
    PENDING: 'PENDING',
    UNTRAINED: 'UNTRAINED',
    FAILED: 'FAILED',
}

export const SCAN_TYPE = {
    ALL: 'ALL',
    ONE: 'ONE',
}

export const TYPE_CONVERSATION = {
    WEB: 'WEB',
    FB: 'FB'
}

export const TYPE_MESSAGE = {
    USER: 'USER',
    BOT: 'BOT',
}

export const STATUS_CONVERSATION_ORDER = {
    PENDING: 'PENDING',
    ACCEPT: 'ACCEPT',
    DONE: 'DONE',
    CANCEL: 'CANCEL',
}

export const ColorMain = '#4ca1f5'

export const DEFAULT_FORM_ORDER = [
    {
        label: 'Họ và tên',
        value: 'name'
    },
    {
        label: 'Số điện thoại',
        value: 'phone'
    },
    {
        label: 'Địa chỉ',
        value: 'address'
    },
    {
        label: 'Số lượng',
        value: 'quantity'
    },
    {
        label: 'Sản phẩm',
        value: 'product'
    },
    {
        label: 'Thời gian',
        value: 'date_time'
    }
]
