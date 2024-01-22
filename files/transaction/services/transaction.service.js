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

    const confirmTransaction = await TransactionRepository.fetchOne({
      priceId,
      userId,
    })

    const { id } = checkout

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

    const { status } = session

    const { priceId } = transaction
    transaction.status = status
    await transaction.save()
    let deliveryTime

    if (status === "complete") {
      const subscription = await SubscriptionRepository.fetchOne({ priceId })
      if (!subscription)
        return {
          return: false,
          msg: `priceId id not identified with subscription`,
        }
      let currentDate = new Date()
      const expiryDate = new Date(
        currentDate.getTime() + deliveryTime * 24 * 60 * 60 * 1000
      )

      const futureDateISOString = expiryDate.toISOString()

      await SubscriptionOrderRepository.create({
        userId: new mongoose.Types.ObjectId(userId),
        subscriptionId: transaction.subscriptionId,
        amount: transaction.amount,
        isConfirmed: true,
        status: "active",
        transactionId: transaction._id,
        expiresAt: futureDateISOString,
      })
    }

    return {
      success: true,
      msg: TransactionSuccess.UPDATE,
      paymentStatus: status,
    }
  }
}

module.exports = { TransactionService }
