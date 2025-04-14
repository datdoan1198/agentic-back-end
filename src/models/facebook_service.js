import createModel, {ObjectId,} from './base'

const FacebookService = createModel(
    'FacebookService',
    'facebook_services',
    {
        access_token: {
            type: String,
            required: true,
        },
        page_access_token: {
            type: String,
            default: ''
        },
        page_id: {
            type: Number,
            default: ''
        },
        page_name: {
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

export default FacebookService
