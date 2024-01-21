const { default: mongoose, mongo } = require("mongoose")
const { StripePaymentService } = require("../../../providers/stripe/stripe")
const { v4: uuidv4 } = require("uuid")
const { TransactionSuccess } = require("../transaction.messages")
const { UserRepository } = require("../../user/user.repository")
const { SessionRepository } = require("../../session/session.repository")
const {
  SubscriptionRepository,
} = require("../../subscription/subscription.repository")
const {
  SubscriptionOrderRepository,
} = require("../../subscriptionOrder/subscriptionOrder.repository")
const {
  NotificationRepository,
} = require("../../notification/notification.repository")

const { TransactionRepository } = require("../transaction.repository")
const { queryConstructor } = require("../../../utils")
const uuid = uuidv4()

class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiateCheckoutSession(payload) {
    const { priceId, userId, subscriptionId } = payload

    const [subscription, user] = await Promise.all([
      await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(userId),
      }),
      await SubscriptionRepository.findSingleSubscriptionWithParams({
        _id: new mongoose.Types.ObjectId(subscriptionId),
        priceId,
      }),
    ])

    if (!subscription)
      return { success: false, msg: `Subscription id not found` }

    if (!user) return { success: false, msg: `User not found` }

    await this.getConfig()
    const checkout = await this.paymentProvider.createCheckOutSession({
      priceId,
      userId,
      uuid,
    })

    if (!checkout)
      return { success: false, msg: `unable to successfully checkout` }

    const confirmTransaction = await TransactionRepository.fetchOne({
      priceId,
      userId,
    })

    const { id, amount_total } = checkout

    if (confirmTransaction) {
      await TransactionRepository.updateTransactionDetails(
        { priceId },
        { sessionId: id }
      )

      return {
        success: true,
        msg: TransactionSuccess.INITIATE,
        data: checkout,
      }
    }

    let originalNumber = amount_total
    let decimalNumber = parseFloat((originalNumber / 100).toFixed(2))

    await TransactionRepository.create({
      amount: decimalNumber,
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
        case "payment_intent.canceled":
          await this.handleCanceledPaymentIntent(event)
          break
        case "payment_intent.payment_failed":
          console.log("the failed payment is working")
          await this.handleFailedPaymentIntent(event)
          break
        case "payment_intent.succeeded":
          console.log("the successful payment is working")
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
    return {
      success: true,
      msg: `Payment verification canceled`,
    }
  }

  static async handleFailedPaymentIntent(event) {
    const paymentIntentPaymentFailed = event.data.object
    await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentPaymentFailed?.id },
      { status: "failed" }
    )

    return {
      success: true,
      msg: `Payment verification failed`,
    }
  }

  static async handleSucceededPaymentIntent(event) {
    const paymentIntentSucceeded = event.data.object

    const getTransaction = await TransactionRepository.fetchOne({
      transactionId: paymentIntentSucceeded?.id,
    })

    const subscription = await SubscriptionRepository.fetchOne({
      _id: new mongoose.Types.ObjectId(getTransaction.subscriptionId),
    })

    // Calculate the expiration date for the next month
    const currentExpiresAt = new Date()
    currentExpiresAt.setMonth(currentExpiresAt.getMonth() + 1)

    await SubscriptionOrderRepository.create({
      amount: getTransaction.amount,
      userId: new mongoose.Types.ObjectId(getTransaction.userId),
      subscriptionId: new mongoose.Types.ObjectId(
        getTransaction.subscriptionId
      ),
      isConfirmed: true,
      dateStarted: new Date(),
      title: subscription.title,
      expiresAt: currentExpiresAt,
    })

    await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentSucceeded?.id },
      { status: "completed" }
    )

    return {
      success: true,
      msg: `Payment verification successful`,
    }
  }
}

module.exports = { TransactionService }
