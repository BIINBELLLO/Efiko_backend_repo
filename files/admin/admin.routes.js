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

//admin route
adminRoute.route("/login").post(adminLogin)

adminRoute.route("/profile").get(getAdminController)

adminRoute.use(isAuthenticated)

adminRoute.route("/").post(adminVerifier, adminSignUpController)

adminRoute.route("/logged-in").get(getLoggedInAdminController)
adminRoute.route("/").get(getAdminController)

//update admin
adminRoute.route("/update/:id").patch(updateAdminController)

adminRoute.route("/student").post(createUserController)

module.exports = adminRoute
