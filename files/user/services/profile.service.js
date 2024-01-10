const { default: mongoose } = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  queryConstructor,
  sanitizePhoneNumber,
  generateOtp,
} = require("../../../utils")
const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")
const { SessionRepository } = require("../../session/session.repository")
const { LIMIT, SKIP, SORT } = require("../../../constants")
const {
  ProfileFailure,
  ProfileSuccess,
} = require("../messages/profile.messages")
const { sendMailNotification } = require("../../../utils/email")

class ProfileService {
  static async updateProfileService(id, payload) {
    const { body, image } = payload
    delete body.email
    delete body.password

    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          profileImage: image,
          ...body,
        },
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async profileImageService(payload, id) {
    const { image } = payload

    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          profileImage: image,
        },
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  //changes
  static async getUserService(userPayload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User"
    )
    if (error) return { success: false, msg: error }

    const total = await UserRepository.findUserWithParams()

    const allUsers = await UserRepository.findAllUsersParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (allUsers.length < 1)
      return { success: true, msg: UserFailure.FETCH, data: [] }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: allUsers,
      length: allUsers.length,
      total: total.length,
    }
  }

  static async UpdateUserService(body, locals) {
    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(locals._id),
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const updateUser = await UserRepository.updateUserProfile(
      { _id: new mongoose.Types.ObjectId(locals._id) },
      {
        ...body,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async changePasswordService(body, locals) {
    const { currentPassword, newPassword } = body

    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const isPassword = await verifyPassword(currentPassword, user.password)

    if (!isPassword) return { success: false, msg: UserFailure.UPDATE }

    user.password = await hashPassword(newPassword)
    const updateUser = await user.save()

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async getUserProfileService(payload) {
    const user = await UserRepository.findSingleUserWithParams(
      {
        ...payload,
      },
      { password: 0 }
    )

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }

  static async getProfileSessionService(payload) {
    const user = await UserRepository.findSingleUserWithParams(
      {
        _id: new mongoose.Types.ObjectId(payload),
      },
      { password: 0 }
    )

    const sessions = await SessionRepository.findAllSessionParams({
      tutorId: new mongoose.Types.ObjectId(payload),
    })

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
      sessions,
    }
  }

  static async educationDocService(payload, id) {
    const { image } = payload

    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $push: {
          "tutorEducationDetails.educationDoc": [...image],
        },
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async nationIdService(payload, id) {
    const { image } = payload

    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          "tutorEducationDetails.nationalId": image,
        },
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async activateAndDeactivateService(params, body) {
    const { action } = body
    let query = {}
    if (action === "Deactivate") {
      query = { status: "Inactive", action: "Activate" }
    }

    if (action === "Activate") {
      query = { status: "Active", action: "Deactivate" }
    }

    const updateUser = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(params) },
      {
        ...query,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async updateTutorService(params, body) {
    let query = {}
    const { approvalStatus } = body
    if (approvalStatus === "Approved") {
      query = { status: "Active" }
    }
    const updateUser = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(params) },
      {
        ...body,
        ...query,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    if (approvalStatus === "Approved" || approvalStatus === "Rejected") {
      const substitutional_parameters = {
        name: updateUser.fullName,
        status: approvalStatus,
      }

      await sendMailNotification(
        updateUser.email,
        "Approval Status",
        substitutional_parameters,
        "APPROVAL"
      )
    }
    return { success: true, msg: UserSuccess.UPDATE }
  }
}

module.exports = { ProfileService }
