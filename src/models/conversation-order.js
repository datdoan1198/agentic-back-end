import createModel, {ObjectId, STATUS_CONVERSATION_ORDER} from './base'

const ConversationOrder = createModel(
    'ConversationOrder',
    'conversation_orders',
    {
        order_information: {
            type: String,
            required: true,
        },
        conversation_id: {
            type: ObjectId,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(STATUS_CONVERSATION_ORDER),
            required: true,
            default: STATUS_CONVERSATION_ORDER.PENDING,
        }
    },{
        virtuals: {
            messages: {
                conversation: {
                    ref: 'Conversation',
                    localField: 'conversation_id',
                    foreignField: '_id',
                    justOne: true,
                },
            }
        },
    }
)

export default ConversationOrder
