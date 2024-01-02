const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    category: {
      type: String,
    },
    subject: {
      type: String,
    },
    issue: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved"],
    },
  },
  { timestamps: true }
)

const report = mongoose.model("Report", reportSchema, "report")

module.exports = { Report: report }
