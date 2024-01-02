const reportRoute = require("express").Router()

const {
  createReportController,
  getReportController,
} = require("./report.controller")

//routes
reportRoute.route("/").post(createReportController)
reportRoute.route("/").get(getReportController)

module.exports = reportRoute
