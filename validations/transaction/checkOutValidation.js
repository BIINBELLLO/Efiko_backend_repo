const checkOutValidation = {
  priceId: {
    notEmpty: true,
    errorMessage: "priceId cannot be empty",
  },
  userId: {
    notEmpty: true,
    errorMessage: " userId cannot be empty",
  },
  channel: {
    notEmpty: true,
    errorMessage: "channel cannot be empty",
  },
  subscriptionId: {
    notEmpty: true,
    errorMessage: "subscriptionId cannot be empty",
  },
  channel: {
    notEmpty: true,
    errorMessage: "quantity cannot be empty",
  },
}

module.exports = { checkOutValidation }
