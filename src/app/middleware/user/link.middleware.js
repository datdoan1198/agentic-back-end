import {STATUS_TRAIN, WebKnowledge} from '@/models'
import {abort} from '@/utils/helpers'

export async function checkNumberOfLink(req, res, next) {
    const numberLink = await WebKnowledge.countDocuments({
        bot_id: req.params.botId,
        status: STATUS_TRAIN.TRAINED
    })

    if (numberLink < 10) {
        next()
        return
    }

    abort(404, 'Số lượng đường dẫn huấn luyện đã vượt giới hạn.')
}
