import scanKnowledgeWeb from './scan-knowledge-web'

export default function executeScheduledTasks() {
    scanKnowledgeWeb.start()
}
