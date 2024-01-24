const subscriptionOrder = require("express").Router()
const { isAuthenticated } = require("../../utils")
const {
  createSubscriptionOrderController,
  getSubscriptionOrderController,
  updateSubscriptionOrderController,
} = require("./subscriptionOrder.controller")

// subscriptionOrder.use(isAuthenticated)

//routes
subscriptionOrder.route("/").post(createSubscriptionOrderController)

subscriptionOrder.route("/").get(getSubscriptionOrderController)

subscriptionOrder.route("/:id").patch(updateSubscriptionOrderController)

module.exports = subscriptionOrder
