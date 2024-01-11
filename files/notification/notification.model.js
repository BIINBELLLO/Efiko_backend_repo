const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["User", "Admin"],
    },
    recipientId: {
      type: mongoose.Types.ObjectId,
      refPath: "userType",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
  },
  { timestamps: true }
)

const notification = mongoose.model(
  "Notification",
  NotificationSchema,
  "notification"
)

module.exports = { Notification: notification }
