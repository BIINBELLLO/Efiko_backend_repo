const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    tutorId: { type: mongoose.Types.ObjectId, ref: "User" },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    outcome: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    charges: {
      type: Number,
    },
    status: {
      type: String,
      default: "pending",
    },
    sessionStatus: {
      type: String,
      enum: ["start", "yet-to-start"],
      default: "yet-to-start",
    },
    type: {
      type: String,
      enum: ["recorded", "not-recorded"],
      default: "not-recorded",
    },
  },
  { timestamps: true }
)

const session = mongoose.model("Session", sessionSchema, "session")

module.exports = { Session: session }
