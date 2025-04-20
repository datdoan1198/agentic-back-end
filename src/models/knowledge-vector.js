import createModel, {ObjectId, PRIORITY_KNOWLEDGE} from './base'

const KnowledgeVector = createModel(
    'KnowledgeVector',
    'knowledge_vectors',
    {
        text: {
            type: String,
            required: true,
        },
        vector: {
            type: [Number],
            default: []
        },
        source_id: {
            type: ObjectId,
            required: true,
        },
        bot_id: {
            type: ObjectId,
            required: true,
        },
        priority: {
            type: Number,
            enum: Object.values(PRIORITY_KNOWLEDGE),
            required: true,
            default: PRIORITY_KNOWLEDGE.MEDIUM,
        }
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
            web_knowledge: {
                options: {
                    ref: 'WebKnowledge',
                    localField: 'source_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        },
    }
)

export default KnowledgeVector
