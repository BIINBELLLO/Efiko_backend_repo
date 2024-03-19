const { default: mongoose } = require("mongoose")
const {
  hashPassword,
  verifyPassword,
  queryConstructor,
} = require("../../../utils")
const { uploadManager } = require("../../../utils/multer")
const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")
const { SessionRepository } = require("../../session/session.repository")
const { sendMailNotification } = require("../../../utils/email")
const {
  NotificationRepository,
} = require("../../notification/notification.repository")
const {
  CurriculumRepository,
} = require("../../curriculum/curriculum.repository")

class ProfileService {
  static async updateProfileService(id, payload) {
    let image
    if (payload.files && payload.files.image) {
      image = await uploadManager(payload, "image")
    }

    const { body } = payload
    delete body.email
    delete body.password

    const { status } = body

    if (!status === "Active" || !status === "Inactive")
      return { success: false, msg: `status is either Active or Inactive` }

    const userProfile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          profileImage: image ? image?.secure_url : null,
          ...body,
        },
      }
    )

    if (!userProfile) return { success: false, msg: UserFailure.UPDATE }

    try {
      if (status === "Inactive") {
        const substitutional_parameters = {
          name: userProfile.firstName,
        }

        await sendMailNotification(
          userProfile.email,
          "Status Deactivated",
          substitutional_parameters,
          "INACTIVE"
        )

        await NotificationRepository.createNotification({
          userTYpe: "User",
          recipientId: new mongoose.Types.ObjectId(userProfile._id),
          title: "Status Deactivated",
          message: `Hi, your Efiko account has been deactivated`,
        })
      }
      if (status === "Active") {
        const substitutional_parameters = {
          name: userProfile.firstName,
        }

        await sendMailNotification(
          userProfile.email,
          "Status Activated",
          substitutional_parameters,
          "ACTIVE"
        )

        await NotificationRepository.createNotification({
          userTYpe: "User",
          recipientId: new mongoose.Types.ObjectId(userProfile._id),
          title: "Status Activated",
          message: `Hi, your Efiko account has been activated`,
        })
      }
    } catch (error) {
      console.log("error", error)
    }
    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async profileImageService(data, id) {
    if (!data.files || !data.files.image)
      return { success: false, msg: `No image upload found` }

    const image = await uploadManager(data, "profileImage")

    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          profileImage: image.secure_url,
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

    const total = await CurriculumRepository.findAllUserParams({ ...params })
    const allUsers = await CurriculumRepository.findAllUserParams({
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

  static async educationDocService(payload, locals) {
    const image = await uploadManager(payload)
    const imageLink = image.secure_url
    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(locals) },
      {
        $push: {
          "tutorEducationDetails.educationDoc": [imageLink],
        },
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async nationIdService(data, id) {
    if (!data.files || !data.files.image)
      return { success: false, msg: `No image upload found` }

    const image = await uploadManager(data, "nationalId")
    const userprofile = await UserRepository.updateUserDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          "tutorEducationDetails.nationalId": image.secure_url,
        },
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
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
