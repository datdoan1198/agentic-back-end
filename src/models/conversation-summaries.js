import createModel, {ObjectId} from './base'

const ConversationSummary = createModel(
    'ConversationSummary',
    'conversation_summaries',
    {
        content: {
            type: String,
            required: true,
        },
        conversation_id: {
            type: ObjectId,
            required: true,
        },
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

export default ConversationSummary
