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

const checkoutTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.initiateCheckoutSession(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const retrieveTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.retrieveCheckOutSession(req.query)
  )
  console.log("error for payment verification", error)

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  getTransactionController,
  checkoutTransactionController,
  retrieveTransactionController,
}
