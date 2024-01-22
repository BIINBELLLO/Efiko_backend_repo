const { SubscriptionOrder } = require("./subscriptionOrder.model")
const mongoose = require("mongoose")

class SubscriptionOrderRepository {
  static async create(payload) {
    return await SubscriptionOrder.create(payload)
  }

  static async findSubscriptionOrderWithParams(payload, select) {
    return await SubscriptionOrder.find({ ...payload }).select(select)
  }

  static async findSingleSubscriptionOrderWithParams(payload, select) {
    return await SubscriptionOrder.findOne({ ...payload }).select(select)
  }

  //get curriculum
  static async findAllSubscriptionOrderParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}

    if (search) {
      query = {
        $or: [{ amount: { $regex: search, $options: "i" } }],
      }
    }

    const subscriptionOrder = await SubscriptionOrder.find({
      ...restOfPayload,
      ...query,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return subscriptionOrder
  }

  static async updateSubscriptionOrderDetails(id, params) {
    return SubscriptionOrder.findOneAndUpdate(
      { ...id },
      { ...params },
      { new: true, runValidators: true }
    )
  }

  static async deleteSubscriptionOrderDetails(id) {
    return SubscriptionOrder.findOneAndDelete({ ...id })
  }
}

module.exports = { SubscriptionOrderRepository }
