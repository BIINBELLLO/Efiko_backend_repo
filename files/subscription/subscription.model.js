const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    amount: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
)

const subscription = mongoose.model(
  "Subscription",
  subscriptionSchema,
  "subscription"
)

module.exports = { Subscription: subscription }
