import { WebKnowledge } from '@/models'
import {abort} from '@/utils/helpers'

export async function checkNumberOfLink(req, res, next) {
    const numberLink = await WebKnowledge.countDocuments({bot_id: req.params.botId})

    if (numberLink < 20) {
        next()
        return
    }

    abort(404, 'Số lượng đường dẫn đã vượt giới hạn.')
}
