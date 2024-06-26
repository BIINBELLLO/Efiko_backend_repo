const { BAD_REQUEST, SUCCESS } = require("../../../constants/statusCode")
const { responseHandler } = require("../../../core/response")
const { manageAsyncOps, fileModifier } = require("../../../utils")
const { CustomError } = require("../../../utils/errors")
const { ProfileService } = require("../services/profile.service")

const getUserController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.getUserService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateUserController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.UpdateUserService(req.body, res.locals.jwt)
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const changePasswordController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.changePasswordService(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getUserProfileController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.getUserProfileService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateUserProfileController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.updateProfileService(req.params.id, req)
  )
  console.log("error", error)
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

const profileImageController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.profileImageService(req, res.locals.jwt._id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

const getProfileSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.getProfileSessionService(req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

const educationDocController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.educationDocService(req, res.locals.jwt._id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

const nationalIdController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.nationIdService(req)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

const updateTutorController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ProfileService.updateTutorService(req.params.id, req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

module.exports = {
  getUserController,
  updateUserController,
  changePasswordController,
  getUserProfileController,
  updateUserProfileController,
  profileImageController,
  getProfileSessionController,
  educationDocController,
  nationalIdController,
  updateTutorController,
}
