const { checkSchema } = require("express-validator")
const userRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { validate } = require("../../validations/validate")

//controller files
const {
  createUserController,
  userLoginController,
  studentLoginCodeController,
} = require("../user/controllers/user.controller")
const {
  updateUserProfileController,
  profileImageController,
  getProfileSessionController,
  educationDocController,
  nationalIdController,
  getUserController,
} = require("./controllers/profile.controller")
const { createUser } = require("../../validations/users/createUser.validation")
const { loginValidation } = require("../../validations/users/loginValidation")

//routes
userRoute
  .route("/")
  .post(validate(checkSchema(createUser)), createUserController)

userRoute
  .route("/login")
  .post(validate(checkSchema(loginValidation)), userLoginController)

userRoute.route("/student-login").post(studentLoginCodeController)

userRoute.route("/").get(getUserController)

userRoute.use(isAuthenticated)

userRoute.patch("/update/:id", updateUserProfileController)

// userRoute.patch(
//   "/education-doc/:id",
//   uploadManager("image").array("educationImage"),
//   educationDocController
// )

userRoute.patch("/national-id/:id", nationalIdController)

userRoute.patch("/profile-image", profileImageController)

userRoute.get("/profile-session/:id", getProfileSessionController)

module.exports = userRoute
