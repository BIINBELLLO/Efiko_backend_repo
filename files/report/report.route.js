const reportRoute = require("express").Router()

const { isAuthenticated } = require("../../utils")
const {
  createReportController,
  getReportController,
  updateReportController,
} = require("./report.controller")

reportRoute.use(isAuthenticated)

//routes
reportRoute.route("/").post(createReportController)
reportRoute.route("/").get(getReportController)
reportRoute.route("/:id").patch(updateReportController)

module.exports = reportRoute
