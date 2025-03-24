import createModel from './base'

const PermissionType = createModel('PermissionType', 'permission_types', {
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
})

export default PermissionType
