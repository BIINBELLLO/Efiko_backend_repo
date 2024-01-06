const subscriptionRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const {
  createSubscriptionController,
  getSubscriptionController,
  updateSubscriptionController,
  deleteSubscriptionController,
} = require("./subscription.controller")

subscriptionRoute.use(isAuthenticated)

//routes
subscriptionRoute.route("/").post(createSubscriptionController)

subscriptionRoute.route("/").get(getSubscriptionController)

subscriptionRoute.route("/:id").patch(updateSubscriptionController)

subscriptionRoute.route("/:id").delete(deleteSubscriptionController)

module.exports = subscriptionRoute
