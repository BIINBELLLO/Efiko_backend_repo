const { uploadManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const userRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { validate } = require("../../validations/validate")

//controller files
const {
  createUserController,
  userLoginController,
} = require("../user/controllers/user.controller")
const {
  updateUserProfileController,
  getUserProfileController,
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

userRoute.route("/").get(getUserProfileController)

userRoute.use(isAuthenticated)

userRoute.patch(
  "/update/:id",
  uploadManager("image").single("profileImage"),
  updateUserProfileController
)

module.exports = userRoute
