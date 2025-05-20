import scanKnowledgeWeb from './scan-knowledge-web'
import {APP_ENV, NODE_ENV} from '@/configs'

export default function executeScheduledTasks() {
    if (NODE_ENV === APP_ENV.PRODUCTION) {
        scanKnowledgeWeb.start()
    }
}
