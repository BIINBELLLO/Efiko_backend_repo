const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    subject: { type: String },
    description: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Resolved"],
    },
  },
  { timestamps: true }
)

const report = mongoose.model("Report", reportSchema, "report")

module.exports = { Report: report }
