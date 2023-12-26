const reportRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { createReportController } = require("./report.controller")

reportRoute.use(isAuthenticated)

//routes
reportRoute.route("/").post(createReportController)

module.exports = reportRoute
