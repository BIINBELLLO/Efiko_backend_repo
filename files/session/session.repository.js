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
    const session = await Session.findOne({ ...sessionPayload }).select(select)

    return session
  }

  static async validateSession(sessionPayload) {
    return Session.exists({ ...sessionPayload })
  }

  static async findAllSessionParams(sessionPayload) {
    const { limit, skip, sort, ...restOfPayload } = sessionPayload

    const session = await Session.find({ ...restOfPayload })
      .populate({ path: "tutorId", select: "userName fullName profileImage" })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return session
  }

  static async updateSessionDetails(id, params) {
    return Session.findOneAndUpdate(
      { ...id },
      { ...params } //returns details about the update
    )
  }
}

module.exports = { SessionRepository }
