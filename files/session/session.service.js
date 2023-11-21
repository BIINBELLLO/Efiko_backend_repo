const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { SessionSuccess, SessionFailure } = require("./session.messages")
const { SessionRepository } = require("./session.repository")
const { LIMIT, SKIP, SORT } = require("../../constants")

class SessionService {
  static async createSession(payload, jwt) {
    const { title, category } = payload
    const { accountType, _id } = jwt

    if (accountType !== "tutor")
      return { success: false, msg: SessionFailure.TUTOR }

    const sessionExist = await SessionRepository.validateSession({
      title,
      category,
    })

    if (sessionExist) return { success: false, msg: SessionFailure.EXIST }

    const session = await SessionRepository.create({
      tutorId: new mongoose.Types.ObjectId(_id),
      ...payload,
    })

    if (!session._id) return { success: false, msg: SessionFailure.CREATE }

    return {
      success: true,
      msg: SessionSuccess.CREATE,
      data: session,
    }
  }

  static async updateSessionService(id, payload) {
    const updateSession = await SessionRepository.updateSessionDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        ...payload,
      }
    )

    if (!updateSession) return { success: false, msg: SessionFailure.UPDATE }

    return { success: true, msg: SessionSuccess.UPDATE }
  }

  static async getSessionService(sessionPayload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      sessionPayload,
      "createdAt",
      "Session"
    )
    if (error) return { success: false, msg: error }

    const sessions = await SessionRepository.findAllSessionParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (sessions.length < 1)
      return { success: false, msg: SessionFailure.FETCH, data: [] }

    return { success: true, msg: SessionSuccess.FETCH, data: sessions }
  }

  static async getSingleSession(payload) {
    const session = await SessionRepository.findSingleUserWithParams({
      ...payload,
    })

    if (!session) return { success: false, msg: SessionFailure.FETCH }

    return {
      success: true,
      msg: SessionSuccess.FETCH,
      data: session,
    }
  }
}

module.exports = { SessionService }
