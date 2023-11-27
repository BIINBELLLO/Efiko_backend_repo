const { default: mongoose } = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  queryConstructor,
  sanitizePhoneNumber,
  generateOtp,
} = require("../../../utils")
const createHash = require("../../../utils/createHash")
const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")
const { SessionRepository } = require("../../session/session.repository")
const { LIMIT, SKIP, SORT } = require("../../../constants")
const {
  ProfileFailure,
  ProfileSuccess,
} = require("../messages/profile.messages")

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

  static async getUserService(userPayload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User"
    )
    if (error) return { success: false, msg: error }

    const allUsers = await UserRepository.findAllUsersParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (allUsers.length < 1) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: allUsers }
  }

  static async UpdateUserService(body, locals) {
    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const updateUser = await UserRepository.updateUserProfile(
      { _id: locals._id },
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

    // Extract only the 'rating' property from each session
    const ratings = sessions.map((session) => session.rating)

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
      ratings,
    }
  }
}

module.exports = { ProfileService }