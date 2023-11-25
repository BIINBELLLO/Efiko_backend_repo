const { default: mongoose, mongo } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { SessionSuccess, SessionFailure } = require("./session.messages")
const { SessionRepository } = require("./session.repository")
const {
  NotificationRepository,
} = require("../notification/notification.repository")

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

    await NotificationRepository.createNotification({
      recipientId: new mongoose.Types.ObjectId(jwt._id),
      title: `Session Created`,
      message: `${jwt.fullName}, you have created a session: ${payload.title} successfully`,
    })

    return {
      success: true,
      msg: SessionSuccess.CREATE,
      data: session,
    }
  }

  static async updateSessionService(id, payload, jwt) {
    const { accountType } = jwt

    if (accountType !== "tutor")
      return { success: false, msg: SessionFailure.TUTOR }

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
    const session = await SessionRepository.findSingleSessionWithParams({
      ...payload,
    })

    if (!session) return { success: false, msg: SessionFailure.FETCH }

    return {
      success: true,
      msg: SessionSuccess.FETCH,
      data: session,
    }
  }

  static async rateSessionService(id, payload, jwt) {
    const session = await SessionRepository.findSingleSessionWithParams({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!session) return { success: false, msg: SessionFailure.FETCH }

    const updateSession = await SessionRepository.updateSessionDetails(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        $push: {
          rating: { ratedBy: new mongoose.Types.ObjectId(jwt._id), ...payload },
        },
      }
    )

    if (!updateSession) return { success: false, msg: SessionFailure.UPDATE }

    return {
      success: true,
      msg: SessionSuccess.UPDATE,
    }
  }

  static async getReviewService(id) {
    const sessions = await SessionRepository.findSessionReview({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!sessions || sessions.length === 0) {
      return { success: false, msg: SessionFailure.FETCH }
    }

    return {
      success: true,
      msg: SessionSuccess.FETCH,
      data: sessions.rating,
    }
  }
}

module.exports = { SessionService }
