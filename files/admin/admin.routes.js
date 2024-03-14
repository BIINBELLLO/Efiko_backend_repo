const adminRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const {
  isAuthenticated,
  adminVerifier,
  adminStatusVerifier,
} = require("../../utils/index")

const {
  adminSignUpController,
  adminLogin,
  getAdminController,
  updateAdminController,
  getLoggedInAdminController,
  resetAdminPasswordController,
} = require("./admin.controller")
const { createUserController } = require("../user/controllers/user.controller")
const {
  getUserController,
  updateTutorController,
  updateUserProfileController,
} = require("../user/controllers/profile.controller")

//admin route
adminRoute.route("/login").post(adminStatusVerifier, adminLogin)

adminRoute.use(isAuthenticated)
adminRoute.route("/profile").get(getAdminController)

adminRoute.route("/").post(adminVerifier, adminSignUpController)

adminRoute.route("/logged-in").get(getLoggedInAdminController)
adminRoute.route("/").get(getAdminController)

//update admin
adminRoute.route("/update/:id").patch(updateAdminController)
adminRoute.route("/reset-password/:id").patch(resetAdminPasswordController)

//user admin routes
adminRoute.route("/student").post(createUserController)
adminRoute.route("/student").get(getUserController)
adminRoute.route("/student/:id").patch(updateUserProfileController)
adminRoute.route("/tutor").get(getUserController)
adminRoute.route("/tutor/:id").patch(updateTutorController)

module.exports = adminRoute
