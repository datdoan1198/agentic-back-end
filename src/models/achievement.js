import mongoose from 'mongoose'
import createModel from './base'

const achievementSchema = {
    name_event: {
        type: String,
        required: true,
    },
    finish_time: {
        type: Date,
        required: true,
    },
    pace: {
        type: String,
        required: true,
    },
    distance: {
        type: String,
        required: true,
    },
    best_achievement: {
        type: Boolean,
        default: false,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
}

export default createModel('Achievement', 'achievements', achievementSchema) 