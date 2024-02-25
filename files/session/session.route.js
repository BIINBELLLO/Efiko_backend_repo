const { checkSchema } = require("express-validator")
const sessionRoute = require("express").Router()
const { isAuthenticated, statusVerifier } = require("../../utils")
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
  deleteSessionController,
} = require("./session.controller")

sessionRoute.route("/zoom/webhook").post(zoomWebhookController)

sessionRoute.use(isAuthenticated)

//routes
sessionRoute.route("/").post(statusVerifier, createSessionController)

sessionRoute.route("/:id").patch(statusVerifier, updateSessionController)

sessionRoute.route("/").get(statusVerifier, getSessionController)
sessionRoute.route("/:id").delete(deleteSessionController)
sessionRoute.route("/rating/:id").patch(rateSessionController)
sessionRoute.route("/rating/:id").get(getReviewServiceController)
sessionRoute.route("/zoom").get(getZoomSessionController)

module.exports = sessionRoute
