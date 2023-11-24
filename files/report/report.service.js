const { default: mongoose, mongo } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { ReportSuccess, ReportFailure } = require("./report.messages")
const { ReportRepository } = require("./report.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class ReportService {
  static async createReport(payload, jwt) {
    const report = await ReportRepository.create({
      reportedBy: new mongoose.Types.ObjectId(jwt._id),
      ...payload,
    })

    if (!report._id) return { success: false, msg: ReportFailure.CREATE }

    return {
      success: true,
      msg: ReportSuccess.CREATE,
      data: report,
    }
  }
}

module.exports = { ReportService }
