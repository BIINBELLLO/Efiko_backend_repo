const initiatePaymentValidation = {
  userId: {
    notEmpty: true,
    errorMessage: "userId cannot be empty",
  },
  subscriptionId: {
    notEmpty: true,
    errorMessage: "subscriptionId cannot be empty",
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
