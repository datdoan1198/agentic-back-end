import createModel, {ObjectId, TYPE_CONVERSATION} from './base'

const Conversation = createModel(
    'Conversation',
    'conversations',
    {
        platform_user_id: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(TYPE_CONVERSATION),
            required: true,
            default: TYPE_CONVERSATION.WEB,
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
            messages: {
                options: {
                    ref: 'Message',
                    localField: '_id',
                    foreignField: 'conversation_id',
                },
            },
            last_message: {
                set(value) {
                    this._last_message = value
                },
                get() {
                    return this._last_message
                },
            }
        },
    }
)

export default Conversation
