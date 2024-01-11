const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../utils")
const {
  SubscriptionSuccess,
  SubscriptionFailure,
} = require("./subscription.messages")
const { SubscriptionRepository } = require("./subsription.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class SubscriptionService {
  static async createSubscription(payload) {
    const subscriptionExist =
      await SubscriptionRepository.findSingleSubscriptionWithParams({
        title: payload.title,
      })

    if (subscriptionExist)
      return { success: false, msg: SubscriptionFailure.EXIST }

    const subscription = await SubscriptionRepository.create({
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

    const total = await SubscriptionRepository.findSubscriptionWithParams({
      ...type,
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
