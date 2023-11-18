const { User } = require("../../files/user/user.model")

const createUser = {
  email: {
    notEmpty: true,
    errorMessage: "email cannot be empty",
    isEmail: {
      errorMessage: "Invalid email address",
    },
    custom: {
      options: (v) => {
        return User.find({
          email: v,
        }).then((user) => {
          if (user.length > 0) {
            return Promise.reject("Email already in use")
          }
        })
      },
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
