import {PERMISSION, Permission, Role} from '@/models'

const permissionData = [
    {
        code: PERMISSION.SUPER_ADMIN,
        description: 'Quyền truy cập tất cả tính năng trong hệ thống.',
    },
    // role management
    {
        code: PERMISSION.LIST_ROLE,
        description: 'Xem danh sách vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.CREATE_ROLE,
        description: 'Tạo mới vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'create',
    },
    {
        code: PERMISSION.UPDATE_ROLE,
        description: 'Chỉnh sửa vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.DELETE_ROLE,
        description: 'Xoá vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'delete',
    },
    // permission management
    {
        code: PERMISSION.UPDATE_PERMISSION_FOR_ROLE,
        description: 'Chỉnh sửa quyền lại cho vai trò',
        permission_group_code: 'permission-management',
        permission_type_code: 'update',
    }
]

async function permissionSeeder(session) {
    for (const item of permissionData) {
        const {code, ...rest} = item
        await Permission.findOneAndUpdate({code}, {$set: rest}, {upsert: true, session})
    }
    const permissionCodes = permissionData.map(({code}) => code)
    const permissionRemove = await Permission.find({code: {$nin: permissionCodes}}).distinct('_id').session(session)
    if (permissionRemove.length > 0) {
        await Permission.deleteMany({_id: {$in: permissionRemove}}, {session})
        await Role.updateMany(
            {permissions: {$in: permissionRemove}},
            {$pull: {permission_ids: {$in: permissionRemove}}},
            {session}
        )
    }
}

export default permissionSeeder
