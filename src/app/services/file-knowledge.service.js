import {Bot, FileKnowledge, STATUS_TRAIN} from '@/models'
import {FileUpload} from '@/utils/classes'
import * as vectorKnowledgeService from '@/app/services/vector-knowledge.service'
import BotConfig from '../../models/bot-config'

export async function getListKnowledgeFiles ({q, page, per_page, field, sort_order}, bot) {
    q = q ? {$regex: q, $options: 'i'} : null

    const filter = {
        ...(q && {$or: [{title: q}]}),
        bot_id: bot._id
    }

    const files = (
        await FileKnowledge.find(filter)
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort({[field || 'order']: sort_order || 'asc'})
            .lean()
    )

    for (const file of files) {
        file.path = FileUpload.in(file.path)
    }

    const total = await FileKnowledge.countDocuments(filter)
    return {total, page, per_page, files}
}

export async function createBotWithFile(currentUser, infoFile, body, session) {
    const { name, description, logo, logo_message, color } = body

    await logo.save('bot/logos')
    const bot = new Bot({
        name,
        logo,
        favicon: logo,
        description,
        user_id: currentUser._id,
    })
    await bot.save({ session })

    await logo_message.save('bot/logos')
    const config = new BotConfig({logo_message, color, bot_id: bot._id, is_order: true})
    await config.save({ session })

    await createFile(infoFile, bot, session)

    return bot
}

export async function createFile (infoFile, bot, session) {
    if (infoFile.file && infoFile.file instanceof FileUpload) {
        infoFile.file = await infoFile.file.save('bot/files')
    }
    const fileKnowledge = new FileKnowledge({
        title: infoFile.title,
        content: infoFile.content,
        path: infoFile.file,
        bot_id: bot._id,
        status: STATUS_TRAIN.TRAINED
    })
    await fileKnowledge.save({ session })

    await vectorKnowledgeService.createVectorKnowledge(
        infoFile.content,
        bot._id,
        fileKnowledge._id,
        session
    )

    return fileKnowledge
}

export async function updateFile (fileOld, infoFile, session) {
    if (fileOld.path) {
        FileUpload.remove(fileOld.path)
        infoFile.file = await infoFile.file.save('bot/files')

        fileOld.title = infoFile.title
        fileOld.path = infoFile.file
        fileOld.content = infoFile.content
    }
    await fileOld.save({ session })

    await vectorKnowledgeService.updateVectorKnowledge(
        infoFile.content,
        fileOld._id,
        session
    )

    return fileOld
}

export async function deleteFile (file, session) {
    await FileKnowledge.deleteOne({_id: file._id}, session)
    await vectorKnowledgeService.deleteVectorKnowledgeWithSourceId(file._id, session)
    FileUpload.remove(file.path)
}
