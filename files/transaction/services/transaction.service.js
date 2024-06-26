const { default: mongoose, mongo } = require("mongoose")
const { StripePaymentService } = require("../../../providers/stripe/stripe")
const { v4: uuidv4 } = require("uuid")
const { TransactionSuccess } = require("../transaction.messages")
const { UserRepository } = require("../../user/user.repository")
const {
  SubscriptionRepository,
} = require("../../subscription/subscription.repository")
const {
  SubscriptionOrderRepository,
} = require("../../subscriptionOrder/subscriptionOrder.repository")
const { sendMailNotification } = require("../../../utils/email")

const { TransactionRepository } = require("../transaction.repository")
const { queryConstructor } = require("../../../utils")
const {
  NotificationRepository,
} = require("../../notification/notification.repository")
let uuid = uuidv4()

class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiateCheckoutSession(payload) {
    const { priceId, userId, subscriptionId } = payload

    const confirmUuid = await TransactionRepository.fetchOne({
      transactionUuid: uuid,
    })

    if (confirmUuid) {
      uuid = uuidv4() // Generate a new UUID
    }

    const [user, subscription] = await Promise.all([
      await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(userId),
      }),
      await SubscriptionRepository.findSingleSubscriptionWithParams({
        _id: new mongoose.Types.ObjectId(subscriptionId),
        priceId,
      }),
    ])

    if (!user) return { success: false, msg: `User not found` }
    if (!subscription)
      return { success: false, msg: `Subscription id not found` }

    await this.getConfig()
    const checkout = await this.paymentProvider.createCheckOutSession({
      priceId,
      userId,
      uuid,
    })

    if (!checkout)
      return { success: false, msg: `unable to successfully checkout` }
    const { id } = checkout

    if (!id)
      return {
        success: false,
        msg: `Transaction incomplete, Session Id not available`,
      }

    await TransactionRepository.create({
      amount: subscription.amount,
      userId,
      priceId,
      sessionId: id,
      subscriptionId,
      transactionUuid: uuid,
    })

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: checkout,
    }
  }

  static async getTransactionService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Transaction"
    )
    if (error) return { success: false, msg: error }

    const transaction = await TransactionRepository.fetchTransactionsByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (transaction.length < 1)
      return { success: false, msg: `you don't hav transaction history` }

    return {
      success: true,
      msg: `transaction fetched successfully`,
      data: transaction,
    }
  }

  static async retrieveCheckOutSession(payload) {
    const { uuid, userId } = payload

    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(userId),
    })

    if (!user) return { success: false, msg: `user not found` }

    const transaction = await TransactionRepository.fetchOne({
      userId: new mongoose.Types.ObjectId(userId),
      transactionUuid: uuid,
    })

    if (!transaction) return { success: false, msg: `transaction not found` }

    await this.getConfig()
    const session = await this.paymentProvider.retrieveCheckOutSession(
      transaction.sessionId
    )
    if (!session.id)
      return { success: false, msg: `unable to unable to verify status` }

    const { status, customer_details } = session
    const { email } = customer_details

    const { priceId } = transaction
    transaction.status = status
    await transaction.save()

    if (status === "complete") {
      const subscription =
        await SubscriptionRepository.findSingleSubscriptionWithParams({
          priceId,
        })
      if (!subscription)
        return {
          return: false,
          msg: `priceId id not identified with subscription`,
        }

      let expirationDays

      // Determine expiration days based on subscription type
      switch (subscription.type) {
        case "Weekly":
          expirationDays = 7
          break
        case "Monthly":
          expirationDays = 31
          break
        case "Bi-Weekly":
          expirationDays = 2
          break
        case "Tri-Weekly":
          expirationDays = 3
          break
        case "Quarterly":
          expirationDays = 93
          break
        case "Semi-Annually":
          expirationDays = 186
          break
        case "Annually":
          expirationDays = 365
          break

        default:
          expirationDays = 2 // Default to 30 days for unknown types
      }

      // Calculate expiresAt by adding expirationDays to currentDate
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)

      const order = await SubscriptionOrderRepository.create({
        name: subscription.type,
        userId: new mongoose.Types.ObjectId(userId),
        userEmail: email,
        subscriptionId: transaction.subscriptionId,
        amount: transaction.amount,
        isConfirmed: true,
        status: "active",
        transactionId: transaction._id,
        expiresAt,
      })

      const expireDate = order.expiresAt
      const splitDate = expireDate.toString()

      try {
        await sendMailNotification(
          email,
          "Subscription Payment",
          {
            type: `${subscription.type}`,
            date: `${splitDate}`,
          },
          "SUBSCRIPTION"
        )
        await NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(userId),
          title: `Subscription Done`,
          message: `Hi, your ${subscription.type} subscription is successful. You can now book a session. Note: Your subscription expires on ${splitDate}`,
        })
      } catch (error) {
        console.log("error", error)
      }
    }

    return {
      success: true,
      msg: TransactionSuccess.UPDATE,
      paymentStatus: status,
    }
  }
}

module.exports = { TransactionService }
