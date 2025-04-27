import {isValidObjectId} from 'mongoose'
import {FileKnowledge} from '@/models'
import {abort} from '@/utils/helpers'

export async function checkFileExit(req, res, next) {
    if (isValidObjectId(req.params.fileId)) {
        const file = await FileKnowledge.findOne({
            _id: req.params.fileId,
            bot_id: req.bot._id
        })

        if (file) {
            req.fileOld = file
            next()
            return
        }
    }

    abort(404, 'File không tồn tại.')
}
