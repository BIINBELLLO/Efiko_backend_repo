const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    amount: {
      type: String,
    },
    currency: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "Weekly",
        "Bi-Weekly",
        "Tri-Weekly",
        "Monthly",
        "Bi-Monthly",
        "Quarterly",
        "Semi-Annually",
        "Annually",
      ],
    },
    priceId: { type: String },
    status: {
      type: String,
      default: "Active",
      enum: ["Inactive", "Active"],
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
