const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    reportedBy: { type: mongoose.Types.ObjectId, ref: "User" },
    category: {
      type: String,
    },
    subject: {
      type: String,
    },
    issue: {
      type: String,
    },
  },
  { timestamps: true }
)

const report = mongoose.model("Report", reportSchema, "report")

module.exports = { Report: report }
