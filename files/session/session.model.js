const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    tutorId: { type: mongoose.Types.ObjectId, ref: "User" },
    studentId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    outcome: {
      type: String,
    },
    start: {
      type: Boolean,
      default: false,
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
    rate: {
      rating: Number,
      recommendTutor: String,
      reviews: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
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
