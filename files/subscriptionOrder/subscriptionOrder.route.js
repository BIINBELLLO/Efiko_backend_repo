const subscriptionOrder = require("express").Router()
const { isAuthenticated } = require("../../utils")
const {
  createSubscriptionOrderController,
  getSubscriptionOrderController,
  updateSubscriptionOrderController,
  deleteSubscriptionOrderController,
} = require("./subscriptionOrder.controller")

subscriptionOrder.use(isAuthenticated)

//routes
subscriptionOrder.route("/").post(createSubscriptionOrderController)

subscriptionOrder.route("/").get(getSubscriptionOrderController)

subscriptionOrder.route("/:id").patch(updateSubscriptionOrderController)

subscriptionOrder.route("/:id").delete(deleteSubscriptionOrderController)

module.exports = subscriptionOrder
