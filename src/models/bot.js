import createModel, { CHATBOX_POSITION, ObjectId, STATUS_BOT } from './base'

const Bot = createModel(
    'Bot',
    'bots',
    {
        url: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            default: '',
        },
        favicon: {
            type: String,
            default: '',
        },
        color: {
            type: String,
            default: '',
        },
        description: {
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
        banner: {
            title: {
                type: String,
                default: '',
            },
            link: {
                type: String,
                default: '',
            },
            image: {
                type: String,
                default: '',
            },
        },
        chat_button_size: {
            desktop: {
                type: Number,
                default: 60,
            },
            mobile: {
                type: Number,
                default: 40,
            },
        },
        alignment: {
            position: {
                type: String,
                enum: Object.values(CHATBOX_POSITION),
                default: 'right',
            },
            offset: {
                x: {
                    type: Number,
                    default: 0,
                },
                y: {
                    type: Number,
                    default: 0,
                },
            },
        },
        status: {
            type: String,
            enum: Object.values(STATUS_BOT),
            required: true,
            default: STATUS_BOT.ACTIVE,
        },
        user_id: {
            type: ObjectId,
            required: true,
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        virtuals: {
            bot: {
                options: {
                    ref: 'User',
                    localField: 'user_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            is_connect_fb: {
                set(value) {
                    this._is_connect_fb = value
                },
                get() {
                    return this._is_connect_fb
                },
            },
            page: {
                set(value) {
                    this._page = value
                },
                get() {
                    return this._page
                },
            },
            fb: {
                options: {
                    ref: 'FacebookService',
                    localField: '_id',
                    foreignField: 'bot_id',
                    justOne: true,
                },
            },
            config_bot: {
                options: {
                    ref: 'BotConfig',
                    localField: '_id',
                    foreignField: 'bot_id',
                    justOne: true,
                },
            },
        },
    }
)

export default Bot
