const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    transactionId: { type: String },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    amount: {
      type: Number,
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
      enum: ["pending", "completed", "failed", "canceled"],
      default: "pending",
    },
    paymentFor: {
      type: String,
    },
    transactionId: { type: String },
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
