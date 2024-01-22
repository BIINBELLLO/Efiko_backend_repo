const mongoose = require("mongoose")

const subscriptionOrderSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    subscriptionId: { type: mongoose.Types.ObjectId, ref: "Subscription" },
    transactionId: {
      type: mongoose.Types.ObjectId,
      ref: "Transaction",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

const subscriptionOrder = mongoose.model(
  "SubscriptionOrder",
  subscriptionOrderSchema,
  "subscriptionOrder"
)

module.exports = { SubscriptionOrder: subscriptionOrder }
