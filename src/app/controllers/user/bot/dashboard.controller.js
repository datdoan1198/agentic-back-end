import * as dashboardService from '@/app/services/dashboard.service'

export async function getGeneralStatistics(req, res) {
    res.status(201).jsonify(await dashboardService.getGeneralStatistics( req.query, req.bot))
}
