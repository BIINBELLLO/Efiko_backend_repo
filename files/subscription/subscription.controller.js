const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { SubscriptionService } = require("./subscription.service")

const createSubscriptionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionService.createSubscription(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getSubscriptionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionService.getSubscriptionService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateSubscriptionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionService.updateSubscriptionService(req.body, req.params)
  )

  console.log("error", error)

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const deleteSubscriptionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionService.deleteSubscriptionService(req.params)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createSubscriptionController,
  getSubscriptionController,
  updateSubscriptionController,
  deleteSubscriptionController,
}
