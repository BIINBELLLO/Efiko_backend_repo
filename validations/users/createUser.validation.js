const { User } = require("../../files/user/user.model")

const createUser = {
  email: {
    notEmpty: true,
    errorMessage: "email cannot be empty",
    isEmail: {
      errorMessage: "Invalid email address",
    },
  },
  password: {
    notEmpty: true,
    errorMessage: "password cannot be empty",
  },
  accountType: {
    notEmpty: true,
    errorMessage: "accountType cannot be empty",
  },
}

module.exports = { createUser }
