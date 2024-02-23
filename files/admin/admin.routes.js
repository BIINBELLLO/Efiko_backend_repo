const adminRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { isAuthenticated, adminVerifier } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const { validate } = require("../../validations/validate")

const {
  adminSignUpController,
  adminLogin,
  getAdminController,
  updateAdminController,
  getLoggedInAdminController,
} = require("./admin.controller")
const { createUserController } = require("../user/controllers/user.controller")
const {
  getUserController,
  updateTutorController,
  updateUserProfileController,
} = require("../user/controllers/profile.controller")

//admin route
adminRoute.route("/login").post(adminLogin)

adminRoute.use(isAuthenticated)
adminRoute.route("/profile").get(getAdminController)

adminRoute.route("/").post(adminVerifier, adminSignUpController)

adminRoute.route("/logged-in").get(getLoggedInAdminController)
adminRoute.route("/").get(getAdminController)

//update admin
adminRoute.route("/update/:id").patch(updateAdminController)

//user admin routes
adminRoute.route("/student").post(createUserController)
adminRoute.route("/student").get(getUserController)
adminRoute.route("/student/:id").patch(updateUserProfileController)
adminRoute.route("/tutor").get(getUserController)
adminRoute.route("/tutor/:id").patch(updateTutorController)

module.exports = adminRoute
