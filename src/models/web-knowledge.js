import createModel, {ObjectId,} from './base'

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
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        bot_id: {
            type: ObjectId,
            required: true,
        },
    },{
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
