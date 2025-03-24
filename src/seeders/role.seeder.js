import {Permission, PERMISSION, Role} from '@/models'

const superAdminRole = {
    name: 'Super Admin',
    code: 'super-admin',
    description: 'Có toàn quyền trong hệ thống',
    can_delete: false,
}

const roleData = [
    {
        name: 'Quản lý hệ thống',
        code: 'admin-manager',
        description: 'Có các quyền quản lý hệ thống',
        can_delete: false,
    }
]

async function roleSeeder(session) {
    const superAdminPermissions = await Permission.find({code: PERMISSION.SUPER_ADMIN})
        .distinct('_id')
        .session(session)
    await Role.findOneAndUpdate(
        {code: superAdminRole.code},
        {
            $set: {
                ...superAdminRole,
                permission_ids: superAdminPermissions,
            },
        },
        {upsert: true, session}
    )

    async function dfs(roles, parent_id = null) {
        for (const {code, children, ...role} of roles) {
            const parent = await Role.findOneAndUpdate(
                {code},
                {$set: {...role, parent_id}},
                {upsert: true, new: true, session}
            )
            if (children) {
                await dfs(children, parent._id)
            }
        }
    }

    await dfs(roleData)
}

export default roleSeeder
