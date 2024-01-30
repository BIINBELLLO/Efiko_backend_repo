const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    curriculumId: { type: mongoose.Types.ObjectId, ref: "Curriculum" },
    tutorId: { type: mongoose.Types.ObjectId, ref: "User" },
    studentId: { type: mongoose.Types.ObjectId, ref: "User" },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    outcome: {
      type: String,
    },
    sessionFor: {
      type: String,
    },
    duration: {
      type: String,
    },
    meetingLink: {
      type: String,
    },
    start: {
      type: Boolean,
      default: false,
    },
    timeAndDate: {
      type: Date,
    },
    date: {
      type: Date,
    },
    book: { type: Boolean, default: false },
    time: {
      type: String,
    },
    meetingPassword: {
      type: String,
    },
    recordingUrl: {
      type: String,
    },
    free: {
      type: Boolean,
      default: "false",
    },
    rating: [
      {
        rate: { type: Number, default: 0 },
        recommendTutor: String,
        review: String,
        ratedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],
    averageRating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "approved"],
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

sessionSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate()
    const session = await this.model.findOne(this.getQuery())

    // Calculate average rating only if there are ratings
    if (session.rating && session.rating.length > 0) {
      const totalRating = session.rating.reduce(
        (sum, current) => sum + current.rate,
        0
      )
      update.$set = update.$set || {}
      update.$set.averageRating = totalRating / session.rating.length
    } else {
      // Set default averageRating if there are no ratings
      update.$set = update.$set || {}
      update.$set.averageRating = 0
    }

    // Call next to continue with the findOneAndUpdate operation
    next()
  } catch (error) {
    // Handle any errors during the calculation
    next(error)
  }
})

const session = mongoose.model("Session", sessionSchema, "session")

module.exports = { Session: session }
