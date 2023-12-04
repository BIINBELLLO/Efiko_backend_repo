const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  initiatePaymentValidation,
} = require("../../validations/transaction/initiatePayment")

const {
  getTransactionController,
  retrieveTransactionController,
  initiateStripePaymentController,
} = require("./controller/transaction.controller")

transactionRoute.get("/", getTransactionController)
transactionRoute.post(
  "/initiate",
  validate(checkSchema(initiatePaymentValidation)),
  initiateStripePaymentController
)
transactionRoute.get("/verify", retrieveTransactionController)

//routes
module.exports = transactionRoute
