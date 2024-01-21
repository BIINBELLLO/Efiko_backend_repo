const userRoute = require("../files/user/user.route")
const authRoute = require("../files/auth/auth.route")
const notificationRoute = require("../files/notification/notification.route")
const adminRoute = require("../files/admin/admin.routes")
const sessionRoute = require("../files/session/session.route")
const reportRoute = require("../files/report/report.route")
const transactionRoute = require("../files/transaction/transaction.route")
const curriculumRoute = require("../files/curriculum/curriculum.route")
const subscriptionRoute = require("../files/subscription/subscription.route")
const subscriptionOrder = require("../files/subscriptionOrder/subscriptionOrder.route")

const routes = (app) => {
  const base_url = "/api/v1"

  app.use(`${base_url}/user`, userRoute)
  app.use(`${base_url}/auth`, authRoute)
  app.use(`${base_url}/notification`, notificationRoute)
  app.use(`${base_url}/admin`, adminRoute)
  app.use(`${base_url}/session`, sessionRoute)
  app.use(`${base_url}/report`, reportRoute)
  app.use(`${base_url}/curriculum`, curriculumRoute)
  app.use(`${base_url}/subscription`, subscriptionRoute)
  app.use(`${base_url}/subscription-order`, subscriptionOrder)
  app.use(`${base_url}/transaction`, transactionRoute)
}

module.exports = routes
