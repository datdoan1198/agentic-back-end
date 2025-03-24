// import runEveryDay from './run-every-day.task'
import {APP_ENV, NODE_ENV} from '@/configs'

export default function executeScheduledTasks() {
    // runEveryDay.start()
    if (NODE_ENV === APP_ENV.PRODUCTION) {
        //
    }
}
