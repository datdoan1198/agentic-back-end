import {PermissionGroup} from '@/models'

const permissionGroupData = [
    {
        name: 'Quản lý vai trò',
        code: 'role-management',
    },
    {
        name: 'Quản lý quyền hạn',
        code: 'permission-management',
        parent_code: 'role-management',
    }
]

async function permissionGroupSeeder(session) {
    for (const [position, item] of permissionGroupData.entries()) {
        const {code, ...rest} = item
        await PermissionGroup.findOneAndUpdate({code}, {$set: {...rest, position}}, {upsert: true, session})
    }
    await PermissionGroup.deleteMany({code: {$nin: permissionGroupData.map(({code}) => code)}}, {session})
}

export default permissionGroupSeeder
