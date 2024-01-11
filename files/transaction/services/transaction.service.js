const { default: mongoose, mongo } = require("mongoose")
const { StripePaymentService } = require("../../../providers/stripe/stripe")
const { TransactionSuccess } = require("../transaction.messages")
const { UserRepository } = require("../../user/user.repository")
const { SessionRepository } = require("../../session/session.repository")
const {
  NotificationRepository,
} = require("../../notification/notification.repository")

const { TransactionRepository } = require("../transaction.repository")
const { queryConstructor } = require("../../../utils")

class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiateStripePayment(payload) {
    const { userId, sessionId, amount, currency } = payload

    await this.getConfig()

    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(userId),
    })

    const session = await SessionRepository.findSingleSessionWithParams({
      _id: new mongoose.Types.ObjectId(sessionId),
    })

    if (!user) return { success: false, msg: `User not found` }
    if (!session) return { success: false, msg: `Session id not found` }

    const paymentIntent = await this.paymentProvider.initiatePaymentIntent({
      amount,
      currency,
    })

    if (!paymentIntent)
      return { success: false, msg: `Unable to create payment intent` }

    const { transactionId } = paymentIntent

    await TransactionRepository.create({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      currency,
      amount,
      userId,
      sessionId,
      transactionId,
    })

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: paymentIntent,
    }
  }

  static async getTransactionService(payload, locals) {
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

  static async stripeWebhookService(event) {
    // Handle the event

    try {
      switch (event.type) {
        case "payment_intent.created":
          await this.handlePaymentIntentCreated(event)
          break
        case "payment_intent.canceled":
          await this.handleCanceledPaymentIntent(event)
          break
        case "payment_intent.payment_failed":
          await this.handleFailedPaymentIntent(event)
          break
        case "payment_intent.succeeded":
          await this.handleSucceededPaymentIntent(event)
          break
        default:
          return {
            success: true,
            msg: "Transaction created successfully",
          }
      }
    } catch (error) {
      console.error("Error in verifyPayment:", error)
      throw error
    }
  }

  static async handleCanceledPaymentIntent(event) {
    const paymentIntentCanceled = event.data.object
    await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentCanceled?.id },
      { status: "canceled" }
    )
  }

  static async handleFailedPaymentIntent(event) {
    const paymentIntentPaymentFailed = event.data.object
    await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentPaymentFailed?.id },
      { status: "failed" }
    )
  }

  static async handleSucceededPaymentIntent(event) {
    const paymentIntentSucceeded = event.data.object

    const getTransaction = await TransactionRepository.fetchOne({
      transactionId: paymentIntentSucceeded?.id,
    })

    const session = await SessionRepository.updateSessionDetails(
      {
        _id: new mongoose.Types.ObjectId(getTransaction.sessionId),
      },
      {
        $push: {
          studentId: new mongoose.Types.ObjectId(getTransaction.userId),
        },
      }
    )

    const transaction = await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentSucceeded?.id },
      { status: "completed" }
    )

    await NotificationRepository.createNotification({
      userType: "Admin",
      title: `Session Booked By Student`,
      message: `${session.title} has been Booked by ${transaction.name}`,
    })
  }

  static async handlePaymentIntentCreated(event) {
    const paymentIntentCreated = event.data.object

    const getTransaction = await TransactionRepository.fetchOne({
      transactionId: paymentIntentCreated?.id,
    })

    const session = await SessionRepository.updateSessionDetails(
      {
        _id: new mongoose.Types.ObjectId(getTransaction.sessionId),
      },
      {
        $push: {
          studentId: new mongoose.Types.ObjectId(getTransaction.userId),
        },
      }
    )

    const transaction = await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentCreated?.id },
      { status: "completed" }
    )

    await NotificationRepository.createNotification({
      userType: "Admin",
      title: `Session Booked By Student`,
      message: `${session.title} has been Booked by ${transaction.name}`,
    })
  }
}

module.exports = { TransactionService }
