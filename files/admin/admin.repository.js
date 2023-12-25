const mongoose = require("mongoose")
const { Admin } = require("../admin/admin.model")

class AdminRepository {
  static async create(body) {
    return Admin.create(body)
  }

  static async fetchAdmin(body) {
    const admin = await Admin.findOne({ ...body })
    return admin
  }

  static async updateAdminDetails(query, params) {
    return Admin.findOneAndUpdate({ ...query }, { $set: { ...params } })
  }

  static async findAdminParams(userPayload) {
    const { limit, skip, sort, search, ...restOfPayload } = userPayload

    let query = {}

    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    }

    const users = await Admin.find({
      ...restOfPayload,
      ...query, // Spread the query object to include its properties
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return users
  }

  static async updateAdminById(id, params) {
    return Admin.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { ...params } },
      { new: true, runValidators: true }
    )
  }
}

module.exports = { AdminRepository }
