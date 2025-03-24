import mongoose from 'mongoose'
import createModel from './base'

const eventSchema = {
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['INTERNAL', 'PUBLIC'],
        required: true,
    },
    event_date: {
        type: Date,
        required: true,
    },
    registration_deadline: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    race_categories: {
        type: String,
        required: true,
    },
    start_time: {
        type: Date,
        required: true,
    },
    cutoff_time: {
        type: String,
        required: true,
    },
    max_participants: {
        type: Number,
        required: true,
    },
    club_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true,
    }
}

export default createModel('Event', 'events', eventSchema) 