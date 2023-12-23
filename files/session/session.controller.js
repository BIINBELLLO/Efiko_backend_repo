const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { SessionService } = require("./session.service")

const initiateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.initiateSessionService(req)
  )

  console.log("error", error)
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getZoomSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getZoomMeetingService()
  )

  console.log("error", error)
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const createSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.createSession(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.updateSessionService(req.params.id, req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getSessionService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const rateSessionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.rateSessionService(req.params.id, req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getReviewServiceController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SessionService.getReviewService(req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}
module.exports = {
  createSessionController,
  updateSessionController,
  getSessionController,
  rateSessionController,
  getReviewServiceController,
  initiateSessionController,
  getZoomSessionController,
}
