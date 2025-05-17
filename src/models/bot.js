import createModel, {ObjectId, STATUS_BOT, STATUS_ORDER} from './base'

const Bot = createModel(
    'Bot',
    'bots',
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
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
        is_order: {
            type: String,
            enum: Object.values(STATUS_ORDER),
            required: true,
            default: STATUS_ORDER.DE_ACTIVE,
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
            business: {
                options: {
                    ref: 'BusinessConfig',
                    localField: '_id',
                    foreignField: 'bot_id',
                    justOne: true,
                },
            },
            order_config: {
                options: {
                    ref: 'OrderConfig',
                    localField: '_id',
                    foreignField: 'bot_id',
                    justOne: true,
                },
            },
        },
    }
)

export default Bot
