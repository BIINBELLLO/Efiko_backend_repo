const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    introduction: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    alternateEmail: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ["Admin"],
      default: "Admin",
    },
    profileImage: String,
  },
  { timestamps: true }
)

const admin = mongoose.model("Admin", adminSchema, "admin")

module.exports = { Admin: admin }
