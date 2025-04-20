import createModel, {ObjectId, TYPE_MESSAGE} from './base'

const Message = createModel(
    'Message',
    'messages',
    {
        sender_id: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        conversation_id: {
            type: ObjectId,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(TYPE_MESSAGE),
            required: true,
            default: TYPE_MESSAGE.BOT,
        }
    },{
        virtuals: {
            messages: {
                options: {
                    ref: 'Bot',
                    localField: 'bot_id',
                    foreignField: '_id',
                    justOne: true,
                },
            }
        },
    }
)

export default Message
