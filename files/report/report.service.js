const { default: mongoose, mongo } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { ReportSuccess, ReportFailure } = require("./report.messages")
const { ReportRepository } = require("./report.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class ReportService {
  static async createReport(payload, params) {
    const report = await ReportRepository.create({
      reportedBy: new mongoose.Types.ObjectId(params),
      ...payload,
    })

    if (!report) return { success: false, msg: ReportFailure.CREATE }

    return {
      success: true,
      msg: ReportSuccess.CREATE,
    }
  }

  static async findSingleReportService(payload) {
    const report = await ReportRepository.findSingleReportWithParams({
      ...payload,
    })

    if (!payload) return { success: false, msg: ReportFailure.FETCH }

    return { success: true, msg: ReportSuccess.FETCH, data: report }
  }

  static async getReportService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Report"
    )
    if (error) return { success: false, msg: error }

    const total = await await ReportRepository.findReportWithParams({
      ...params,
    })

    const reports = await ReportRepository.findAllReportParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (reports.length < 1)
      return { success: true, msg: ReportFailure.FETCH, data: [] }

    return {
      success: true,
      msg: ReportSuccess.FETCH,
      data: reports,
      length: reports.length,
      total: total.length,
    }
  }

  static async updateReportService(payload, id) {
    const report = await ReportRepository.updateReportDetails(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      { ...payload }
    )

    if (!payload) return { success: false, msg: ReportFailure.UPDATE }

    return { success: true, msg: ReportSuccess.UPDATE }
  }
}

module.exports = { ReportService }
