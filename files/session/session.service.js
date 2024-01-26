const { default: mongoose, mongo } = require("mongoose")
const { queryConstructor } = require("../../utils")
const { SessionSuccess, SessionFailure } = require("./session.messages")
const { SessionRepository } = require("./session.repository")
const { UserRepository } = require("../user/user.repository")
const {
  SubscriptionOrderRepository,
} = require("../subscriptionOrder/subscriptionOrder.repository")
const {
  NotificationRepository,
} = require("../notification/notification.repository")
const { ZoomAPiServiceProvider } = require("../../providers/zoom/zoom.api")
const { sendMailNotification } = require("../../utils/email")

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

  static async updateSessionService(id, payload, params) {
    const { status, tutorId, book } = payload
    let extra = {}
    if (book) {
      // Get subscription orders where the current date is not greater than expiresAt
      const currentDate = new Date()
      const [subscriptionOrder, subscriptionOrderExist] = Promise.all([
        await SubscriptionOrderRepository.findAllSubscriptionOrderParams({
          userId: new mongoose.Types.ObjectId(params),
          expiresAt: { $gte: currentDate },
        }),
        await SubscriptionOrderRepository.findAllSubscriptionOrderParams({
          userId: new mongoose.Types.ObjectId(params),
        }),
      ])

      if (subscriptionOrder.length < 1)
        return {
          success: true,
          msg: `User cannot book session, subscription order expired`,
          data: [],
        }
        
      if (subscriptionOrderExist.length < 1)
        return {
          success: false,
          msg: `User does not have subscription`,
          data: [],
        }
      extra = { $push: { studentId: new mongoose.Types.ObjectId(params._id) } }
    }

    const updateSession = await SessionRepository.updateSessionDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        ...payload,
        ...extra,
      }
    )

    if (!updateSession) return { success: false, msg: SessionFailure.UPDATE }

    if (status === "approved") {
      const session = await SessionRepository.findSingleSessionWithParams({
        _id: new mongoose.Types.ObjectId(id),
      })

      const studentId = session.studentId[0]._id
      const studentEmail = session.studentId[0].email
      const studentName = session.studentId[0].firstName

      session.sessionFor = studentId
      await session.save()

      Promise.all([
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(studentId),
          userType: "User",
          title: `Session Approved`,
          message: `Hi, Your session - ${session.title} has been approved`,
        }),
        await sendMailNotification(
          `${studentEmail}`,
          "Session Approved",
          { name: `${studentName}`, session: `${session.title}` },
          "SESSION_APPROVED"
        ),
      ])
    }

    if (tutorId) {
      const tutor = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(tutorId),
      })

      Promise.all([
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(tutor._id),
          userType: "User",
          title: `Assigned Session`,
          message: `Hi, You been assigned to - ${updateSession.title} session`,
        }),
        await sendMailNotification(
          `${tutor.email}`,
          "Assigned Session",
          { name: `${tutor.fullName}`, session: `${updateSession.title}` },
          "SESSION"
        ),
      ])
    }

    if (book) {
      const user = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(params),
      })

      Promise.all([
        await NotificationRepository.createNotification({
          userType: "Admin",
          title: `Session Booked`,
          message: `Hi, Session - ${updateSession.title} has been booked`,
        }),
        await NotificationRepository.createNotification({
          userType: "User",
          title: `Session Booked`,
          message: `Hi, you have booked - ${updateSession.title} session. Thank you`,
        }),
        await sendMailNotification(
          `${user.email}`,
          "Session Booked",
          { name: `${user.firstName}`, session: `${updateSession.title}` },
          "BOOKING"
        ),
      ])
    }
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
