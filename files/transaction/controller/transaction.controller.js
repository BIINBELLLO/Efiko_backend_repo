const { BAD_REQUEST, SUCCESS } = require("../../../constants/statusCode")
const { responseHandler } = require("../../../core/response")
const { manageAsyncOps } = require("../../../utils")
const { CustomError } = require("../../../utils/errors")
const { TransactionService } = require("../services/transaction.service")
// const crypto = require("crypto")

const getTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.getTransactionService(req.query)
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const initiateStripePaymentController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.initiateStripePayment(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const stripeWebHookController = async (req, res, next) => {
  try {
    const event = req.body

    console.log("body", event)

    const [error, data] = await manageAsyncOps(
      TransactionService.stripeWebhookService(event)
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

    return responseHandler(res, SUCCESS, data)
  } catch (error) {
    console.error("Error in stripeWebHookController:", error)
    next(error)
  }
}

module.exports = {
  getTransactionController,
  initiateStripePaymentController,
  stripeWebHookController,
}
