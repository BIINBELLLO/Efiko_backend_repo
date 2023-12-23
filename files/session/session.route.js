const { uploadManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const sessionRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { validate } = require("../../validations/validate")
const {
  sessionValidation,
} = require("../../validations/session/session.validation")
const {
  createSessionController,
  updateSessionController,
  getSessionController,
  rateSessionController,
  getReviewServiceController,
  initiateSessionController,
  getZoomSessionController,
} = require("./session.controller")

sessionRoute.route("/zoom").post(initiateSessionController)
sessionRoute.route("/zoom").get(getZoomSessionController)

sessionRoute.use(isAuthenticated)

//routes
sessionRoute
  .route("/")
  .post(validate(checkSchema(sessionValidation)), createSessionController)

sessionRoute.route("/:id").patch(updateSessionController)

sessionRoute.route("/").get(getSessionController)
sessionRoute.route("/rating/:id").patch(rateSessionController)
sessionRoute.route("/rating/:id").get(getReviewServiceController)

module.exports = sessionRoute
