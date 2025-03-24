import mongoose from 'mongoose'
import createModel from './base'

const eventParticipantSchema = {
    bib_number: {
        type: String,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    }
}

export default createModel('EventParticipant', 'event_participants', eventParticipantSchema) 