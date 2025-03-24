import createModel from './base'

const UserPermissionGroup = createModel(
    'UserPermissionGroup',
    'user_permission_groups',
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
    }
)

export default UserPermissionGroup
