import createModel, { ObjectId, SCAN_TYPE, STATUS_WEB_KNOWLEDGE } from './base'

const WebKnowledge = createModel(
    'WebKnowledge',
    'web_knowledge',
    {
        url: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        content: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: Object.values(STATUS_WEB_KNOWLEDGE),
            required: true,
            default: STATUS_WEB_KNOWLEDGE.UNTRAINED,
        },
        scan_type: {
            type: String,
            enum: Object.values(SCAN_TYPE),
            required: true,
            default: SCAN_TYPE.ALL,
        },
        bot_id: {
            type: ObjectId,
            required: true,
        },
    },
    {
        virtuals: {
            bot: {
                options: {
                    ref: 'Bot',
                    localField: 'bot_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        },
    }
)

export default WebKnowledge
