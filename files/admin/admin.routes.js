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

//admin route
adminRoute.route("/login").post(adminLogin)

adminRoute.route("/profile").get(getAdminController)

adminRoute.use(isAuthenticated)

adminRoute
  .route("/")
  .post(
    adminVerifier,
    uploadManager("adminImage").single("image"),
    adminSignUpController
  )

adminRoute.route("/logged-in").get(getLoggedInAdminController)

//update admin
adminRoute
  .route("/update/:id")
  .patch(uploadManager("adminImage").single("image"), updateAdminController)

module.exports = adminRoute
