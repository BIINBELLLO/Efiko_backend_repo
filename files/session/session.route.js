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
  getZoomSessionController,
  zoomWebhookController,
} = require("./session.controller")

sessionRoute.route("/zoom/webhook").post(zoomWebhookController)

sessionRoute.use(isAuthenticated)

//routes
sessionRoute.route("/").post(createSessionController)

sessionRoute.route("/:id").patch(updateSessionController)

sessionRoute.route("/").get(getSessionController)
sessionRoute.route("/rating/:id").patch(rateSessionController)
sessionRoute.route("/rating/:id").get(getReviewServiceController)
sessionRoute.route("/zoom").get(getZoomSessionController)

module.exports = sessionRoute
