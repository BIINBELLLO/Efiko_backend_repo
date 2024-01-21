const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  initiatePaymentValidation,
} = require("../../validations/transaction/initiatePayment")

const {
  getTransactionController,
  stripeWebHookController,
  checkoutTransactionController,
} = require("./controller/transaction.controller")
const { isAuthenticated } = require("../../utils")

transactionRoute.get("/", getTransactionController)
transactionRoute.post("/stripe-webhook", stripeWebHookController)

// transactionRoute.use(isAuthenticated)

transactionRoute.post(
  "/initiate",
  validate(checkSchema(initiatePaymentValidation)),
  checkoutTransactionController
)

//routes
module.exports = transactionRoute
