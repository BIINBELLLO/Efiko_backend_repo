const { pagination } = require("../../utils")
const { Transaction } = require("./transaction.model")

class TransactionRepository {
  static async create(transactionPayload) {
    return Transaction.create({ ...transactionPayload })
  }

  static async fetchOne(payload) {
    return Transaction.findOne({ ...payload })
  }

  static async fetchTransactionsByParams(userPayload) {
    const { limit, skip, sort, ...restOfPayload } = userPayload

    const { currentSkip, currentLimit } = pagination(skip, limit)

    const transaction = await Transaction.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return transaction
  }

  static async fetch(payload, select) {
    return Transaction.find({ ...payload }).select(select)
  }

  static async updateTransactionDetails(transactionPayload, update) {
    return await Transaction.findOneAndUpdate(
      {
        ...transactionPayload,
      },
      { ...update },
      { new: true, runValidators: true } //returns details about the update
    )
  }
}

module.exports = { TransactionRepository }
