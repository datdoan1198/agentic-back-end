import {PermissionType} from '@/models'

const permissionTypeData = [
    {
        name: 'Truy cập',
        code: 'list',
    },
    {
        name: 'Tạo mới',
        code: 'create',
    },
    {
        name: 'Chỉnh sửa',
        code: 'update',
    },
    {
        name: 'Xoá',
        code: 'delete',
    },
    {
        name: 'Xem chi tiết',
        code: 'read',
    },
]

async function permissionTypeSeeder(session) {
    for (const [position, item] of permissionTypeData.entries()) {
        const {code, ...rest} = item
        await PermissionType.findOneAndUpdate(
            {code},
            {$set: {...rest, position}},
            {upsert: true, session}
        )
    }
    await PermissionType.deleteMany({code: {$nin: permissionTypeData.map(({code}) => code)}}, {session})
}

export default permissionTypeSeeder
