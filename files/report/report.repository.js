const { Report } = require("./report.model")
const mongoose = require("mongoose")

class ReportRepository {
  static async create(reportPayload) {
    return await Report.create(reportPayload)
  }

  static async findSingleReportWithParams(reportPayload, select) {
    const report = await Report.findOne({ ...reportPayload }).select(select)

    return report
  }
  static async findReportWithParams(reportPayload, select) {
    const report = await Report.find({ ...reportPayload }).select(select)

    return report
  }

  static async findAllReportParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        ...restOfPayload,
      }
    }

    if (search === null || search === undefined) {
      query = {
        ...restOfPayload,
      }
    }

    const report = await Report.find({ ...query })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return report
  }

  static async updateReportDetails(id, params) {
    return Report.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { ReportRepository }
