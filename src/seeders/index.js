import {db} from '@/configs'
import chalk from 'chalk'
// import adminSeeder from './admin.seeder'
// import permissionTypeSeeder from './permission-type.seeder'
// import permissionGroupSeeder from './permission-group.seeder'
// import permissionSeeder from './permission.seeder'
// import roleSeeder from './role.seeder'
import descriptionJobSeeder from './description-job.seeder'

async function seed() {
    await db.transaction(async function (session) {
        console.log(chalk.bold('Initializing data...'))
        // await permissionTypeSeeder(session)
        // await permissionGroupSeeder(session)
        // await permissionSeeder(session)
        // await roleSeeder(session)
        // await adminSeeder(session)
        // await adminSeeder(session)
        // await adminSeeder(session)
        await descriptionJobSeeder(session)
        console.log(chalk.bold('Data has been initialized!'))
    })
}

db.connect().then(seed).then(db.close)
