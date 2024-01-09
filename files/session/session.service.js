const { default: mongoose, mongo } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { SessionSuccess, SessionFailure } = require("./session.messages")
const { SessionRepository } = require("./session.repository")
const {
  NotificationRepository,
} = require("../notification/notification.repository")
const { ZoomAPiServiceProvider } = require("../../providers/zoom/zoom.api")

class SessionService {
  static async initiateSessionService(payload) {
    const session = await ZoomAPiServiceProvider.initiateZoomMeeting(payload)
    if (!session) return { success: false, msg: `unable to create session` }

    return session
  }

  static async createSession(payload) {
    const { title, category } = payload

    const sessionExist = await SessionRepository.validateSession({
      title,
      category,
    })

    if (sessionExist) return { success: false, msg: SessionFailure.EXIST }

    const initiateSession = await this.initiateSessionService(payload)

    const { meeting_url, password, meetingTime, purpose, duration } =
      initiateSession

    const session = await SessionRepository.create({
      title: purpose,
      free: payload.free,
      category: payload.category,
      tutorId: new mongoose.Types.ObjectId("6593fcbae5e7901f474cd999"),
      outcome: payload.outcome,
      description: payload.description,
      duration,
      meetingLink: meeting_url,
      timeAndDate: meetingTime,
      curriculumId: new mongoose.Types.ObjectId(payload.curriculumId),
      data: payload.data,
      time: payload.time,
      meetingPassword: password,
    })

    if (!session._id) return { success: false, msg: SessionFailure.CREATE }

    return {
      success: true,
      msg: SessionSuccess.CREATE,
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

    const total = await SessionRepository.findSessionWithParams()

    const sessions = await SessionRepository.findAllSessionParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (sessions.length < 1)
      return { success: true, msg: SessionFailure.FETCH, data: [] }

    return {
      success: true,
      msg: SessionSuccess.FETCH,
      data: sessions,
      length: sessions.length,
      total: total.length,
    }
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
      return { success: true, msg: SessionFailure.FETCH, data: false }
    }

    return {
      success: true,
      msg: SessionSuccess.FETCH,
      data: sessions.rating,
    }
  }
}

module.exports = { SessionService }
