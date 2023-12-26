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

const retrieveTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.retrieveCheckOutSession(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const stripeWebHookController = async (req, res, next) => {
  const sig = req.headers["stripe-signature"]
  let event

  event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.WEBHOOK_SECRET
  )
  event = req.body
  const [error, data] = await manageAsyncOps(
    TransactionService.stripeWebhookService(event)
  )
  res.send(200)
}

module.exports = {
  getTransactionController,
  initiateStripePaymentController,
  retrieveTransactionController,
  stripeWebHookController,
}
