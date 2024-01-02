const { default: mongoose, mongo } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { ReportSuccess, ReportFailure } = require("./report.messages")
const { ReportRepository } = require("./report.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class ReportService {
  static async createReport(payload) {
    const report = await ReportRepository.create({
      ...payload,
    })

    if (!report._id) return { success: false, msg: ReportFailure.CREATE }

    return {
      success: true,
      msg: ReportSuccess.CREATE,
      data: report,
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
    }
  }
}

module.exports = { ReportService }
