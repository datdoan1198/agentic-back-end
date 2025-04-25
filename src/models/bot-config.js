import createModel, {ObjectId} from './base'

const BotConfig = createModel(
    'BotConfig',
    'bot_configs',
    {
        logo_message: {
            type: String,
            default: '',
        },
        color: {
            type: String,
            default: '',
        },
        welcome_messages: {
            type: [String],
            default: ['Xin chào, tôi là trợ lý ảo của bạn 👋', 'Tôi rất sẵn lòng hỗ trợ 😊'],
        },
        quick_prompts: {
            type: [String],
            default: [],
        },
        auto_display_chatbox: {
            type: String,
            default: '',
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
            }
        },
    }
)

export default BotConfig
