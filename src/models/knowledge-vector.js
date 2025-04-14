import createModel, {ObjectId} from './base'

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
            required: true,
            default: 1,
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
