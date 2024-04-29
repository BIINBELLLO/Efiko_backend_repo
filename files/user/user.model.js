const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    fullName: {
      type: String,
    },
    firstName: { type: String },
    lastName: { type: String },
    loginCode: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    age: {
      type: String,
    },
    profileImage: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      unique: true,
    },
    tutorEducationDetails: {
      education: { type: String },
      teachingExperience: { type: String },
      subject: { type: String },
      educationDoc: { type: String }, // Make sure to define it as an array of strings
      nationalId: { type: String },
    },
    studentSubjectInterest: [String],
    studentEducationDetails: {
      education: { type: String },
      careerInterest: { type: String },
    },
    password: { type: String },
    description: { type: String },
    accountType: {
      type: String,
      required: true,
      enum: ["student", "tutor"],
    },
    stripeCustomerId: { type: String },
    isDelete: {
      type: Boolean,
      default: false,
    },
    profileUpdated: {
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
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
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
