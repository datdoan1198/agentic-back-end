import createModel from './base'

const DescriptionJob = createModel(
    'DescriptionJob',
    'description_jobs',
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        virtuals: {
            //
        },
    }
)

export default DescriptionJob
