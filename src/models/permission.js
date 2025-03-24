import createModel from './base'

const Permission = createModel(
    'Permission',
    'permissions',
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        permission_group_code: {
            type: String,
            default: null,
        },
        permission_type_code: {
            type: String,
            default: null,
        },
    },
    {
        virtuals: {
            active: {
                set(value) {
                    this._active = value
                },
                get() {
                    return this._active
                }
            },
            disabled: {
                set(value) {
                    this._disabled = value
                },
                get() {
                    return this._disabled
                }
            },
        },
    }
)

export default Permission
