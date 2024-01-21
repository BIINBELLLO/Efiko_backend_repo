const initiatePaymentValidation = {
  userId: {
    notEmpty: true,
    errorMessage: "userId cannot be empty",
  },
  subscriptionId: {
    notEmpty: true,
    errorMessage: "subscriptionId cannot be empty",
  },
  priceId: {
    notEmpty: true,
    errorMessage: "amount cannot be empty",
  },
}

module.exports = { initiatePaymentValidation }
