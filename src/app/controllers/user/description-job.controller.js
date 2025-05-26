import {DescriptionJob} from '@/models'

export async function getListBotChats(req, res) {
    const result = await DescriptionJob.find().lean()
    res.status(201).jsonify(result)
}
