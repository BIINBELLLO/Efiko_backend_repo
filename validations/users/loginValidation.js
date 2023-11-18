
const loginValidation = {
  email: {
    notEmpty: true,
    errorMessage: "email cannot be empty",
  },
  password: {
    notEmpty: true,
    errorMessage: "password cannot be empty",
  },
}

module.exports = { loginValidation }
