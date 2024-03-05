const { pagination } = require("../../utils")
const { Subscription } = require("./subscription.model")
const mongoose = require("mongoose")

class SubscriptionRepository {
  static async create(payload) {
    return await Subscription.create(payload)
  }

  static async findSubscriptionWithParams(payload, select) {
    return await Subscription.find({ ...payload }).select(select)
  }

  static async findSingleSubscriptionWithParams(payload, select) {
    const subscription = await Subscription.findOne({ ...payload }).select(
      select
    )

    return subscription
  }

  //get curriculum
  static async findAllSubscriptionParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { amount: { $regex: search, $options: "i" } },
        ],
      }
    }

    const { currentSkip, currentLimit } = pagination(skip, limit)

    const subscription = await Subscription.find({ ...restOfPayload, ...query })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return subscription
  }

  static async updateSubscriptionDetails(id, params) {
    return Subscription.findOneAndUpdate(
      { ...id },
      { ...params },
      { new: true, runValidators: true }
    )
  }

  static async deleteSubscriptionDetails(id, params) {
    return Subscription.findOneAndDelete({ ...id })
  }
}

module.exports = { SubscriptionRepository }
