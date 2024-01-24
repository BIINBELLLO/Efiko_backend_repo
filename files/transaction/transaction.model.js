const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ["stripe", "other"],
      default: "stripe",
    },
    subscriptionId: {
      type: mongoose.Types.ObjectId,
      ref: "Subscription",
    },
    status: {
      type: String,
      enum: ["pending", "complete", "failed", "canceled", "open"],
      default: "pending",
    },
    channel: {
      type: String,
      default: "stripe",
    },
    sessionId: {
      type: String,
    },
    priceId: {
      type: String,
    },
    transactionUuid: {
      type: String,
    },
    currency: {
      type: String,
    },
    metaData: String,
  },
  { timestamps: true }
)

const transaction = mongoose.model(
  "Transaction",
  TransactionSchema,
  "transaction"
)

module.exports = { Transaction: transaction }
