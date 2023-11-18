const adminRoute = require("express").Router()
const { isAuthenticated, adminVerifier } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const { getUserController } = require("../user/controllers/profile.controller")
const {
  adminSignUpController,
  adminLogin,
  getAdminController,
} = require("./admin.controller")

//admin route
adminRoute.route("/").post(adminSignUpController)
adminRoute.route("/login").post(adminLogin)
adminRoute.route("/profile").get(getAdminController)

adminRoute.use(isAuthenticated)

//user
adminRoute.route("/user").get(getUserController)


module.exports = adminRoute
