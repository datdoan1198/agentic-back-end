import {Admin, ROLE, Role} from '@/models'

async function adminSeeder(session) {
    const name = 'Super Admin'
    const phone = '0987654321'
    const email = 'admin@gmail.com'
    const password = 'Z3ntSoft@D3v'
    const role = await Role.findOne({code: ROLE.SUPER_ADMIN}).session(session)
    await Admin.findOneAndUpdate(
        {phone, email},
        { $set: {name, phone, email, password, role_ids: [role._id]} },
        { upsert: true, session}
    )
}

export default adminSeeder
