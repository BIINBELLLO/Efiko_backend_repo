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
const { AdminRepository } = require("../admin/admin.repository")

class SessionService {
  static async initiateSessionService(payload) {
    const session = await ZoomAPiServiceProvider.initiateZoomMeeting(payload)
    if (!session) return { success: false, msg: `unable to create session` }

    return session
  }

  static async updateMeetingService(id, payload) {
    const session = await ZoomAPiServiceProvider.updateZoomMeeting(id, payload)
    if (!session) return { success: false, msg: `unable to update Session` }

    return session
  }

  static async getZoomSessionService() {
    const session = await ZoomAPiServiceProvider.getZoomMeeting()
    if (!session) return { success: false, msg: `unable to get zoom session` }

    return session
  }

  static async createSession(payload) {
    const { title, category, tutorId } = payload

    const sessionExist = await SessionRepository.validateSession({
      title,
      category,
    })

    if (sessionExist) return { success: false, msg: SessionFailure.EXIST }

    const initiateSession = await this.initiateSessionService(payload)

    const { meeting_url, password, purpose, duration, meetingId, meetingTime } =
      initiateSession

    const session = await SessionRepository.create({
      title: purpose,
      free: payload.free,
      meetingId,
      category: payload.category,
      outcome: payload.outcome,
      description: payload.description,
      rating: [{}],
      duration,
      meetingLink: meeting_url,
      curriculumId: new mongoose.Types.ObjectId(payload.curriculumId),
      date: meetingTime,
      time: payload.time,
      passCode: "123456",
      meetingPassword: password,
    })

    if (!session._id) return { success: false, msg: SessionFailure.CREATE }

    if (tutorId) {
      const tutor = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(tutorId),
      })

      await Promise.all([
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(tutor._id),
          userType: "User",
          title: `Assigned Session`,
          message: `Hi, You been assigned to - ${session.title} session`,
        }),
        await NotificationRepository.createNotification({
          userType: "Admin",
          title: `Session Approved`,
          message: `Hi, You have assigned session - ${session.title} to a tutor`,
        }),
        await sendMailNotification(
          `${tutor.email}`,
          "Assigned Session",
          { name: `${tutor.fullName}`, session: `${session.title}` },
          "SESSION"
        ),
      ])
    }

    return {
      success: true,
      msg: SessionSuccess.CREATE,
    }
  }

  static async getZoomSession() {
    const initiateSession = await this.getZoomSessionService()

    if (!initiateSession) return { success: false, msg: `unsuccessful` }

    return {
      success: true,
      msg: `successful`,
    }
  }

  static async updateSessionService(id, payload, params) {
    const { status, tutorId, book } = payload

    const confirmSession = await SessionRepository.findSingleSessionWithParams({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!confirmSession) return { success: false, msg: SessionFailure.FETCH }
    let extra = {}

    if (book) {
      if (confirmSession.book)
        return { success: false, msg: "Current session already booked" }
      // Get subscription orders where the current date is not greater than expiresAt
      const currentDate = new Date()

      const subscriptionOrder =
        await SubscriptionOrderRepository.findAllSubscriptionOrderParams({
          userId: new mongoose.Types.ObjectId(params),
          expiresAt: { $gte: currentDate },
        })

      const subscriptionOrderExist =
        await SubscriptionOrderRepository.findSingleSubscriptionOrderWithParams(
          {
            userId: new mongoose.Types.ObjectId(params),
            expiresAt: { $gte: currentDate },
          }
        )

      if (!subscriptionOrderExist)
        return {
          success: false,
          msg: `User does not have subscription`,
          data: [],
        }

      if (subscriptionOrder.length < 1)
        return {
          success: true,
          msg: `User cannot book session, subscription order expired`,
          data: [],
        }

      extra = { studentId: new mongoose.Types.ObjectId(params) }
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

      if (!session.studentId) {
        session.status = "pending"
        await session.save()
        return {
          success: false,
          msg: `Approval can only be done when there's a student for the session`,
        }
      }

      const studentId = session.studentId._id
      const studentEmail = session.studentId.email
      const studentName = session.studentId.firstName

      session.sessionFor = studentId
      await session.save()

      await Promise.all([
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(studentId),
          userType: "User",
          title: `Session Approved`,
          message: `Hi, Your session - ${session.title} has been approved`,
        }),
        await NotificationRepository.createNotification({
          userType: "Admin",
          title: `Session Approved`,
          message: `Hi, You have approved session - ${session.title} has been approved. 
          Note: Approval or Disapproval of the session will be done by Efiko Admin`,
        }),
        await sendMailNotification(
          `${studentEmail}`,
          "Session Approved",
          { name: `${studentName}`, session: `${session.title}.` },
          "SESSION_APPROVED"
        ),
      ])
    }

    if (status === "disapproved") {
      const session = await SessionRepository.findSingleSessionWithParams({
        _id: new mongoose.Types.ObjectId(id),
      })

      if (!session.studentId) {
        session.status = "disapproved"
        await session.save()
        return {
          success: false,
          msg: `Unable to disapprove a pending session.`,
        }
      }

      const studentId = session.studentId._id
      const studentEmail = session.studentId.email
      const studentName = session.studentId.firstName

      session.sessionFor = ""
      delete session.studentId
      await session.save()

      await Promise.all([
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(studentId),
          userType: "User",
          title: `Session Disapproved`,
          message: `Hi, Your session - ${session.title} has been disapproved`,
        }),
        await NotificationRepository.createNotification({
          userType: "Admin",
          title: `Session Disapproved`,
          message: `Hi, session - ${session.title} has been disapproved`,
        }),
        await sendMailNotification(
          `${studentEmail}`,
          "Session Disapproved",
          { name: `${studentName}`, session: `${session.title}` },
          "SESSION_DISAPPROVED"
        ),
      ])
    }

    if (tutorId) {
      const tutor = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(tutorId),
      })

      await Promise.all([
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(tutor._id),
          userType: "User",
          title: `Assigned Session`,
          message: `Hi, You been assigned to - ${updateSession.title} session`,
        }),
        await NotificationRepository.createNotification({
          userType: "Admin",
          title: `Session Approved`,
          message: `Hi, You have assigned session - ${updateSession.title} to a tutor`,
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
      const allAdmin = await AdminRepository.fetchAdminParams()

      const user = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(params),
      })

      updateSession.studentNumber = 1
      await updateSession.save()

      Promise.all([
        await NotificationRepository.createNotification({
          userType: "Admin",
          title: `Session Booked`,
          message: `Hi, Session - ${updateSession.title} has been booked`,
        }),
        await NotificationRepository.createNotification({
          userType: "User",
          recipientId: new mongoose.Types.ObjectId(user._id),
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

      try {
        for (let i = 0; i <= 3; i++) {
          const admin = allAdmin[i]
          await sendMailNotification(
            `${admin?.email}`,
            "Session Booked",
            { session: `${updateSession.title}` },
            "ADMIN_BOOKING"
          )
        }
      } catch (error) {
        console.log("mail notification error", error.message)
      }
    }

    return { success: true, msg: SessionSuccess.UPDATE }
  }

  static async getSessionService(sessionPayload, locals) {
    const { error, params, limit, skip, sort } = queryConstructor(
      sessionPayload,
      "createdAt",
      "Session"
    )
    if (error) return { success: false, msg: error }

    const total = await SessionRepository.findSessionWithParams()

    const currentDatePlus24Hours = new Date()
    currentDatePlus24Hours.setHours(currentDatePlus24Hours.getHours() + 24)

    let extras = {}
    // if (locals.accountType === "student" || locals.accountType === "tutor") {
    extras = { date: { $gte: currentDatePlus24Hours } }
    // }

    const sessions = await SessionRepository.findAllSessionParams({
      ...params,
      ...extras,
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

  static async deleteSession(payload) {
    const session = await SessionRepository.deleteSessionDetails({
      _id: new mongoose.Types.ObjectId(payload),
    })

    if (!session) return { success: false, msg: SessionFailure.DELETE }

    return {
      success: true,
      msg: SessionSuccess.DELETE,
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

  static async zoomSessionWebhookService(params) {
    const { event, payload } = params
    try {
      // Check if the event is a recording completed event
      if (event === "recording.stopped") {
        const { id } = payload.object
        // Find the meeting in the database
        const meeting = await SessionRepository.findSingleSessionWithParams({
          meetingId: id,
        })

        if (!meeting) new Error("Meeting/Session not available")

        const zoom = await ZoomAPiServiceProvider.getZoomMeeting(id)

        if (zoom) {
          // Update the urlRecord field with the recording link
          meeting.recordingLink = `${zoom}`
          meeting.type = "recorded"

          // Save the updated meeting in the database
          await meeting.save()
        }
      }
    } catch (error) {
      console.log("update zoom recording error", error.message)
    }
  }
}

module.exports = { SessionService }
