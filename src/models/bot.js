import createModel, { ObjectId, STATUS_BOT } from './base'

const Bot = createModel(
    'Bot',
    'bots',
    {
        url: {
            type: String,
            default: '',
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
        description: {
            type: String,
            default: '',
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
