import createModel, {ObjectId} from './base'

const OrderConfig = createModel(
    'OrderConfig',
    'order_configs',
    {
        form_order: {
            type: String,
            required: true,
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

export default OrderConfig
