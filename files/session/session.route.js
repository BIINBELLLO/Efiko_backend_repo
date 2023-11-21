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
  searchSessionController,
} = require("./session.controller")

sessionRoute.use(isAuthenticated)

//routes
sessionRoute
  .route("/")
  .post(validate(checkSchema(sessionValidation)), createSessionController)

sessionRoute.route("/:id").patch(updateSessionController)

sessionRoute.route("/").get(getSessionController)

module.exports = sessionRoute
