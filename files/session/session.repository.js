const { Session } = require("./session.model")
const mongoose = require("mongoose")

class SessionRepository {
  static async create(sessionPayload) {
    return await Session.create(sessionPayload)
  }

  static async findSessionWithParams(sessionPayload, select) {
    return await Session.find({ ...sessionPayload }).select(select)
  }

  static async findSingleSessionWithParams(sessionPayload, select) {
    const session = await Session.findOne({ ...sessionPayload })
      .select(select)
      .populate({
        path: "studentId",
        select: "_id userName fullName firstName lastName profileImage email", // Specify the fields you want to include
      })

    return session
  }

  static async validateSession(sessionPayload) {
    return Session.exists({ ...sessionPayload })
  }

  static async findAllSessionParams(sessionPayload) {
    const { limit, skip, sort, search, ...restOfPayload } = sessionPayload

    let query = {}

    if (search) {
      query = {
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { time: { $regex: search, $options: "i" } },
          { duration: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      }
    }

    const session = await Session.find({ ...restOfPayload, ...query })
      .populate({
        path: "curriculumId",
      })
      .populate({
        path: "tutorId",
        select: "userName fullName firstName lastName profileImage email",
      })
      .populate({
        path: "studentId",
        select: "userName fullName firstName lastName profileImage email",
      })
      .populate({
        path: "rating.ratedBy",
        model: "User",
        select: "userName fullName firstName lastName profileImage email", // Select the fields you want to include from the User model
      })
      .sort({ timeAndDate: -1 })
      .skip(skip)
      .limit(limit)

    return session
  }

  static async findSessionReview(payload) {
    return Session.findById({ ...payload })
      .populate({
        path: "rating.ratedBy",
        model: "User",
        select: "userName fullName firstName lastName profileImage email",
      })
      .exec()
  }

  static async updateSessionDetails(id, params) {
    return Session.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }

  static async deleteSessionDetails(id, params) {
    return Session.findOneAndDelete({ ...id })
  }
}

module.exports = { SessionRepository }
