const { uploadManager } = require("../../utils/multer")
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
  getUserProfileController,
  tutorProfileUpdateController,
  profileImageController,
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

userRoute.route("/").get(getUserProfileController)

userRoute.use(isAuthenticated)

userRoute.patch(
  "/update/:id",
  uploadManager("image").array("image"),
  updateUserProfileController
)

userRoute.patch(
  "/profile-image",
  uploadManager("profile").single("image"),
  profileImageController
)

module.exports = userRoute
