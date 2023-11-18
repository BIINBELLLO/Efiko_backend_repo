const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    fullName: {
      type: String,
    },
    age: {
      type: Number,
    },
    country: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    tutorEducationDetails: {
      education: { type: String },
      teachingExperience: { type: String },
      subject: { type: String },
      educationDoc: { type: String },
      nationalId: { type: String },
    },
    studentEducationDetails: {
      education: { type: String },
      majors: { type: String },
      subject: [{ type: String }],
    },
    password: { type: String },
    description: { type: String },
    accountType: {
      type: String,
      required: true,
      enum: ["student", "tutor"],
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordToken: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    verificationOtp: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    verified: { type: Date, default: Date.now() },
  },
  { timestamps: true }
)

const user = mongoose.model("User", userSchema, "user")

module.exports = { User: user }
