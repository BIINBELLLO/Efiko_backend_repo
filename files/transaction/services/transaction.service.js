const { default: mongoose, mongo } = require("mongoose")
const { v4: uuidv4 } = require("uuid")
const { StripePaymentService } = require("../../../providers/stripe/stripe")
const {
  TransactionFailure,
  TransactionSuccess,
  TransactionMessages,
} = require("../transaction.messages")
const { UserRepository } = require("../../user/user.repository")
const { SessionRepository } = require("../../session/session.repository")

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

    if (!user) return { success: false, msg: `user not found` }
    if (!session) return { success: false, msg: `session id not found` }

    console.log("second place")
    const paymentIntent = await this.paymentProvider.initiatePaymentIntent({
      amount,
      currency,
    })

    if (!paymentIntent)
      return { success: false, msg: `unable to successfully checkout` }

    await TransactionRepository.create({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      currency,
      amount,
      userId,
      sessionId,
    })

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: paymentIntent,
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

    let deliveryTime
    let planType

    transaction.status = status
    await transaction.save()

    if (status === "complete") {
      const subscription = await SubscriptionPlanRepository.fetchOne({
        $or: [
          { "availablePlans.basic.priceId": priceId },
          { "availablePlans.pro.priceId": priceId },
          { "availablePlans.max.priceId": priceId },
        ],
      })

      if (subscription.availablePlans.basic.priceId === priceId) {
        deliveryTime = subscription.availablePlans.basic.deliveryTime
        planType = "basic"
      } else if (subscription.availablePlans.pro.priceId === priceId) {
        deliveryTime = subscription.availablePlans.pro.deliveryTime
        planType = "pro"
      } else if (subscription.availablePlans.max.priceId === priceId) {
        deliveryTime = subscription.availablePlans.max.deliveryTime
        planType = "max"
      }

      const currentDate = new Date()
      const futureDate = new Date(
        currentDate.getTime() + deliveryTime * 24 * 60 * 60 * 1000
      )

      const futureDateISOString = futureDate.toISOString()

      await OrderService.createOrder({
        userId: new mongoose.Types.ObjectId(userId),
        orderName: transaction.subscriptionId,
        orderValue: transaction.cost,
        isConfirmed: true,
        status: "active",
        transactionId: transaction._id,
        dateOfDelivery: futureDateISOString,
        selectedTire: planType,
      })
    } else {
      await OrderService.createOrder({
        userId: new mongoose.Types.ObjectId(userId),
        orderName: transaction.subscriptionId,
        orderValue: transaction.cost,
        isConfirmed: true,
        transactionId: transaction._id,
      })
    }

    return {
      success: true,
      msg: TransactionSuccess.UPDATE,
      paymentStatus: status,
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
      return { success: false, msg: `you don't have any transaction history` }

    return {
      success: true,
      msg: `transaction fetched successfully`,
      data: transaction,
    }
  }
}

module.exports = { TransactionService }
