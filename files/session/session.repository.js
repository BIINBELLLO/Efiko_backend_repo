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
      .lean()

    return session
  }

  static async validateSession(sessionPayload) {
    return Session.exists({ ...sessionPayload })
  }

  static async findAllSessionParams(sessionPayload) {
    const { limit, skip, sort, ...restOfPayload } = sessionPayload

    const { search, ...rest } = restOfPayload

    let query = {}

    if (search) {
      query = { title: { $regex: search, $options: "i" }, ...rest }
    }

    if (search === null || search === undefined) {
      query = {
        ...rest,
      }
    }

    const session = await Session.find({ ...query })
      .populate({
        path: "curriculumId",
        // select: "userName fullName profileImage email",
      })
      .populate({
        path: "tutorId",
        select: "userName fullName profileImage email",
      })
      .populate({
        path: "studentId",
        select: "userName fullName profileImage email",
      })
      .populate({
        path: "rating.ratedBy",
        model: "User",
        select: "fullName userName", // Select the fields you want to include from the User model
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
        select: "userName fullName",
      })
      .exec()
  }

  static async updateSessionDetails(id, params) {
    return Session.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { SessionRepository }
