import createModel from './base'

const PermissionGroup = createModel(
    'PermissionGroup',
    'permission_groups',
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        position: {
            type: Number,
            required: true,
        },
        parent_code: {
            type: String,
            default: null,
        },
    },
    {
        virtuals: {
            types: {
                set(value) {
                    this._types = value
                },
                get() {
                    return this._types
                },
            },
            children: {
                set(value) {
                    this._children = value
                },
                get() {
                    return this._children
                },
            },
        },
    }
)

export default PermissionGroup
