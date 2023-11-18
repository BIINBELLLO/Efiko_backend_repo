const mongoose = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  generateOtp,
} = require("../../../utils")
const createHash = require("../../../utils/createHash")
const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")

const { LIMIT, SKIP, SORT } = require("../../../constants")
const { sendMailNotification } = require("../../../utils/email")
// const { sendMailNotification } = require("../../../utils/email")
class UserService {
  static async createUser(payload) {
    const { fullName, email } = payload

    const userExist = await UserRepository.validateUser({
      email,
    })

    if (userExist) return { success: false, msg: UserFailure.EXIST }

    const { otp, expiry } = generateOtp()

    //hash password
    const user = await UserRepository.create({
      ...payload,
      verificationOtp: otp,
      password: await hashPassword(payload.password),
    })

    if (!user._id) return { success: false, msg: UserFailure.CREATE }

    const substitutional_parameters = {
      name: fullName,
      emailOtp: otp,
    }

    await sendMailNotification(
      email,
      "Sign-Up",
      substitutional_parameters,
      "VERIFICATION"
    )

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

    if (userProfile.isVerified !== true)
      return { success: false, msg: UserFailure.VERIFIED }

    if (!userProfile) return { success: false, msg: UserFailure.USER_EXIST }

    const isPassword = await verifyPassword(password, userProfile.password)

    if (!isPassword) return { success: false, msg: UserFailure.PASSWORD }

    let token

    userProfile.password = undefined

    token = await tokenHandler({
      _id: userProfile._id,
      username: userProfile.username,
      fullName: userProfile.fullName,
      email: userProfile.email,
      accountType: userProfile.accountType,
      isAdmin: false,
    })

    const user = {
      _id: userProfile._id,
      username: userProfile.username,
      fullName: userProfile.fullName,
      email: userProfile.email,
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
