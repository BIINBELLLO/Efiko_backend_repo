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
    sessionId: {
      type: mongoose.Types.ObjectId,
      ref: "Session",
    },
    status: {
      type: String,
      // enum: ["pending", "paid", "failed", "open", "unpaid", "canceled"],
      default: "pending",
    },
    paymentFor: {
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
