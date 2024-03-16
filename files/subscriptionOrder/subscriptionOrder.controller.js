const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { SubscriptionOrderService } = require("./subscriptionOrder.service")

const createSubscriptionOrderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionOrderService.createSubscriptionOrder(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getSubscriptionOrderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionOrderService.getSubscriptionOrderService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateSubscriptionOrderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionOrderService.updateSubscriptionOrderService(
      req.body,
      req.params
    )
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createSubscriptionOrderController,
  getSubscriptionOrderController,
  updateSubscriptionOrderController,
}
