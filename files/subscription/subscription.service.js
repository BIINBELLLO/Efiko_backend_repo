const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../utils")
const {
  SubscriptionSuccess,
  SubscriptionFailure,
} = require("./subscription.messages")
const { StripePaymentService } = require("../../providers/stripe/stripe")
const { SubscriptionRepository } = require("./subscription.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class SubscriptionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async createSubscription(payload) {
    const { title, currency, amount } = payload
    const subscriptionExist =
      await SubscriptionRepository.findSingleSubscriptionWithParams({
        title: payload.title,
      })

    if (subscriptionExist)
      return { success: false, msg: SubscriptionFailure.EXIST }

    await this.getConfig()
    const product = await this.paymentProvider.createProductId(
      title,
      currency,
      amount
    )
    console.log("product", product)
    const subscription = await SubscriptionRepository.create({
      priceId: product,
      currency,
      ...payload,
    })

    if (!subscription._id)
      return { success: false, msg: SubscriptionFailure.CREATE }

    return {
      success: true,
      msg: SubscriptionSuccess.CREATE,
    }
  }

  static async getSubscriptionService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Subscription"
    )
    if (error) return { success: false, msg: error }
    const { status } = payload

    let type = {}
    if (status === "Active") {
      type = { status: "Active" }
    }

    let allData
    if (params.search) {
      const { search, ...restOfData } = params
      allData = { ...restOfData }
    }
    const total = await SubscriptionRepository.findSubscriptionWithParams({
      ...type,
      ...allData,
    })

    const subscription = await SubscriptionRepository.findAllSubscriptionParams(
      {
        ...params,
        limit,
        skip,
        sort,
      }
    )

    if (subscription.length < 1)
      return { success: true, msg: SubscriptionFailure.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: SubscriptionSuccess.FETCH,
      data: subscription,
      length: subscription.length,
      total: total.length,
    }
  }

  static async updateSubscriptionService(data, params) {
    const subscription = await SubscriptionRepository.updateSubscriptionDetails(
      { _id: new mongoose.Types.ObjectId(params.id) },
      {
        ...data,
      }
    )

    if (!subscription)
      return {
        success: false,
        msg: SubscriptionFailure.CREATE,
      }

    return {
      success: true,
      msg: SubscriptionSuccess.UPDATE,
    }
  }

  static async deleteSubscriptionService(params) {
    const subscription = await SubscriptionRepository.deleteSubscriptionDetails(
      {
        _id: new mongoose.Types.ObjectId(params.id),
      }
    )

    if (!subscription)
      return {
        success: false,
        msg: SubscriptionFailure.DELETE,
      }

    return {
      success: true,
      msg: SubscriptionSuccess.DELETE,
    }
  }
}

module.exports = { SubscriptionService }
