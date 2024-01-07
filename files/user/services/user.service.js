const mongoose = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  generateOtp,
  AlphaNumeric,
} = require("../../../utils")

const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")

const { sendMailNotification } = require("../../../utils/email")
const {
  NotificationRepository,
} = require("../../notification/notification.repository")

class UserService {
  static async createUser(payload, locals) {
    const { firstName, email, accountType, fullName } = payload

    const userExist = await UserRepository.validateUser({
      email,
    })

    if (userExist) return { success: false, msg: UserFailure.EXIST }

    const { otp, expiry } = generateOtp()

    let verificationOtp = ""
    let approvalStatus = ""

    if (locals?.accountType === "superAdmin") {
      const generatePassword = await AlphaNumeric(8)

      const user = await UserRepository.create({
        ...payload,
        isVerified: true,
        password: await hashPassword(generatePassword),
      })

      if (!user._id) return { success: false, msg: UserFailure.CREATE }

      const substitutional_parameters = {
        name: firstName,
        password: generatePassword,
        email,
      }

      try {
        await sendMailNotification(
          email,
          "Sign-Up",
          substitutional_parameters,
          "ADMIN_STUDENT"
        )
      } catch (error) {
        console.log("error", error)
      }
      await NotificationRepository.createNotification({
        recipientId: new mongoose.Types.ObjectId(user._id),
        title: `New User`,
        message: `Welcome to Efiko Learning, we are glad to have you with us`,
      })

      return {
        success: true,
        msg: UserSuccess.CREATE,
      }
    }

    if (accountType === "tutor") {
      verificationOtp = otp
      approvalStatus = "Pending"
    }

    //hash password
    const user = await UserRepository.create({
      ...payload,
      verificationOtp,
      password: await hashPassword(payload.password),
    })

    if (!user._id) return { success: false, msg: UserFailure.CREATE }

    const substitutional_parameters = {
      name: fullName,
      emailOtp: otp,
    }

    ///send mail to tutor only tutor
    if (accountType === "tutor") {
      try {
        await sendMailNotification(
          email,
          "Sign-Up",
          substitutional_parameters,
          "VERIFICATION"
        )
      } catch (error) {
        console.log("error", error)
      }
      await NotificationRepository.createNotification({
        recipientId: new mongoose.Types.ObjectId(user._id),
        title: `New User`,
        message: `Welcome to Efiko Learning, we are glad to have you with us`,
      })
    }

    return {
      success: true,
      msg: UserSuccess.CREATE,
    }
  }

  static async userLogin(payload) {
    const { email, password } = payload

    //return result
    const userProfile = await UserRepository.findSingleUserWithParams({
      email: email,
    })

    let updatedProfile = false

    if (
      userProfile.accountType === "tutor" &&
      userProfile.fullName &&
      userProfile.description !== false &&
      userProfile.age !== false &&
      userProfile.country !== false
      // userProfile.tutorEducationDetails.education &&
      // userProfile.tutorEducationDetails.nationalId
    ) {
      updatedProfile = true
    }

    if (!userProfile.isVerified)
      return { success: false, msg: UserFailure.VERIFIED }

    if (userProfile.accountType !== "tutor")
      return { success: false, msg: UserFailure.VERIFIED }

    if (!userProfile) return { success: false, msg: UserFailure.USER_EXIST }

    const isPassword = await verifyPassword(password, userProfile.password)

    if (!isPassword) return { success: false, msg: UserFailure.PASSWORD }

    let token

    userProfile.password = undefined

    token = await tokenHandler({
      _id: userProfile._id,
      userName: userProfile.userName,
      fullName: userProfile.fullName,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      age: userProfile.age,
      country: userProfile.country,
      profileImage: userProfile.profileImage,
      email: userProfile.email,
      accountType: userProfile.accountType,
      isAdmin: false,
    })

    const user = {
      _id: userProfile._id,
      userName: userProfile.userName,
      fullName: userProfile.fullName,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      age: userProfile.age,
      country: userProfile.country,
      profileImage: userProfile.profileImage,
      email: userProfile.email,
      accountType: userProfile.accountType,
      updatedProfile,
      ...token,
    }

    //return
    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }

  static async studentUserLogin(payload) {
    const { loginCode } = payload

    //return result
    const userProfile = await UserRepository.findSingleUserWithParams({
      loginCode: loginCode,
      accountType: "student",
    })

    if (!userProfile) return { success: false, msg: UserFailure.USER_EXIST }

    userProfile.loginCode = ""

    userProfile.save()

    let updatedProfile = true

    if (
      userProfile.accountType === "student" &&
      !userProfile.userName &&
      !userProfile.fullName &&
      !userProfile.age &&
      !userProfile.country &&
      !userProfile.studentEducationDetails.education &&
      !userProfile.studentEducationDetails.education
    ) {
      updatedProfile = false
    }

    let token

    token = await tokenHandler({
      _id: userProfile._id,
      userName: userProfile.userName,
      fullName: userProfile.fullName,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      age: userProfile.age,
      country: userProfile.country,
      profileImage: userProfile.profileImage,
      email: userProfile.email,
      accountType: userProfile.accountType,
      isAdmin: false,
    })

    const user = {
      _id: userProfile._id,
      userName: userProfile.userName,
      fullName: userProfile.fullName,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      age: userProfile.age,
      country: userProfile.country,
      profileImage: userProfile.profileImage,
      email: userProfile.email,
      accountType: userProfile.accountType,
      updatedProfile,
      ...token,
    }

    //return result
    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }
}
module.exports = { UserService }
