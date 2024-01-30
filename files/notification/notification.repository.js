const { Notification } = require("./notification.model")

class NotificationRepository {
  static async createNotification(notificationPayload) {
    return await Notification.create(notificationPayload)
  }

  static async findSingleNotificationByParams(notificationPayload) {
    return await Notification.findOne({ ...notificationPayload })
  }

  static async fetchNotificationsByParams(userPayload) {
    let { limit, skip, sort, ...restOfPayload } = userPayload

    const notification = await Notification.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return notification
  }
}

module.exports = { NotificationRepository }
