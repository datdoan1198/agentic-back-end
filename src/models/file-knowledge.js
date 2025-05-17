import createModel, {ObjectId, STATUS_TRAIN} from './base'

const FileKnowledge = createModel(
    'FileKnowledge',
    'file_knowledge',
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        extension: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(STATUS_TRAIN),
            required: true,
            default: STATUS_TRAIN.UNTRAINED,
        },
        bot_id: {
            type: ObjectId,
            required: true,
        },
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
            },
        },
    }
)

export default FileKnowledge
