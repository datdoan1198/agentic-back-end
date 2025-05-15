import createModel, {ObjectId} from './base'

const BusinessConfig = createModel(
    'BusinessConfig',
    'business_configs',
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        logo: {
            type: String,
            default: '',
        },
        bot_id: {
            type: ObjectId,
            required: true,
        }
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

export default BusinessConfig
