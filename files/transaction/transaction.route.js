const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  initiatePaymentValidation,
} = require("../../validations/transaction/initiatePayment")

const {
  getTransactionController,
  checkoutTransactionController,
  retrieveTransactionController,
} = require("./controller/transaction.controller")
const { isAuthenticated } = require("../../utils")

// transactionRoute.get("/", getTransactionController)

//authenticate
transactionRoute.use(isAuthenticated)

transactionRoute.post(
  "/initiate",
  validate(checkSchema(initiatePaymentValidation)),
  checkoutTransactionController
)
transactionRoute.get("/verify", retrieveTransactionController)

//routes
module.exports = transactionRoute
