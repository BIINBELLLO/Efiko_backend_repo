const { Report } = require("./report.model")
const mongoose = require("mongoose")

class ReportRepository {
  static async create(reportPayload) {
    return await Report.create(reportPayload)
  }

  static async findReportWithParams(reportPayload, select) {
    return await Report.find({ ...reportPayload }).select(select)
  }

  static async findSingleReportWithParams(reportPayload, select) {
    const report = await Report.findOne({ ...reportPayload }).select(select)

    return report
  }

  static async findAllReportParams(reportPayload) {
    const { limit, skip, sort, ...restOfPayload } = reportPayload

    const Report = await Report.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return Report
  }

  static async updateReportDetails(id, params) {
    return Report.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { ReportRepository }
