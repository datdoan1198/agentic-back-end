import * as fileKnowledgeService from '@/app/services/file-knowledge.service'
import {db} from '@/configs'

export async function getListKnowledgeFiles(req, res) {
    const result = await fileKnowledgeService.getListKnowledgeFiles(req.query, req.bot)
    res.status(201).jsonify(result)
}

export async function createFile(req, res) {
    await db.transaction(async function (session) {
        const result = await fileKnowledgeService.createFile(req.infoFile, req.bot, session)
        res.status(201).jsonify(result)
    })
}

export async function updateFile(req, res) {
    await db.transaction(async function (session) {
        const result = await fileKnowledgeService.updateFile(req.fileOld, req.infoFile, session)
        res.status(201).jsonify(result)
    })
}

export async function deleteFile(req, res) {
    await db.transaction(async function (session) {
        await fileKnowledgeService.deleteFile(req.fileOld, session)
        res.status(201).jsonify()
    })
}
