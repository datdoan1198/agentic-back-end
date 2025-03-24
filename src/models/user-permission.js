import createModel from './base'

const UserPermission = createModel(
    'UserPermission',
    'user-permissions',
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
    }
)

export default UserPermission
