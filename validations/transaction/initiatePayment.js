const initiatePaymentValidation = {
  sessionId: {
    notEmpty: true,
    errorMessage: "sessionId cannot be empty",
  },
  userId: {
    notEmpty: true,
    errorMessage: " userId cannot be empty",
  },
  amount: {
    notEmpty: true,
    errorMessage: " userId cannot be empty",
  },
  currency: {
    notEmpty: true,
    errorMessage: " userId cannot be empty",
  },
}

module.exports = { initiatePaymentValidation }
