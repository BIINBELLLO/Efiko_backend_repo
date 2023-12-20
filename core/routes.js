const userRoute = require("../files/user/user.route")
const authRoute = require("../files/auth/auth.route")
const notificationRoute = require("../files/notification/notification.route")
const adminRoute = require("../files/admin/admin.routes")
const sessionRoute = require("../files/session/session.route")
const reportRoute = require("../files/report/report.route")
const transactionRoute = require("../files/transaction/transaction.route")

const routes = (app) => {
  const base_url = "/api/v1"

  app.use(`${base_url}/user`, userRoute)
  app.use(`${base_url}/auth`, authRoute)
  app.use(`${base_url}/notification`, notificationRoute)
  app.use(`${base_url}/admin`, adminRoute)
  app.use(`${base_url}/session`, sessionRoute)
  app.use(`${base_url}/report`, reportRoute)
  app.use(`${base_url}/transaction`, transactionRoute)
  app.use(`${base_url}/admin`, adminRoute)
}

module.exports = routes
