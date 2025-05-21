import * as dashboardService from '@/app/services/dashboard.service'

export async function getGeneralStatistics(req, res) {
    res.status(201).jsonify(await dashboardService.getGeneralStatistics(req.query, req.bot))
}

export async function getTotalMessageByDay(req, res) {
    res.status(201).jsonify(await dashboardService.getTotalMessageByDay(req.bot))
}

export async function getLatestMessage(req, res) {
    res.status(201).jsonify(await dashboardService.getLatestMessage(req.bot))
}
