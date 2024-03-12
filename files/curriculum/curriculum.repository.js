const { pagination } = require("../../utils")
const { Admin } = require("../admin/admin.model")
const { User } = require("../user/user.model")
const { Curriculum } = require("./curriculum.model")
const mongoose = require("mongoose")

class CurriculumRepository {
  static async create(payload) {
    return await Curriculum.create(payload)
  }

  static async findCurriculumWithParams(payload, select) {
    return await Curriculum.find({ ...payload }).select(select)
  }

  static async findSingleCurriculumWithParams(payload, select) {
    const report = await Curriculum.findOne({ ...payload }).select(select)

    return report
  }

  //get curriculum
  static async findAllCurriculumParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
        ...restOfPayload,
      }
    }

    if (search === null || search === undefined) {
      query = {
        ...restOfPayload,
      }
    }
    const { currentSkip, currentLimit } = pagination(skip, limit)
    const curriculum = await Curriculum.find({ ...query })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return curriculum
  }

  static async findAllUserParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}

    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
        ],
      }
    }

    const { currentSkip, currentLimit } = pagination(skip, limit)

    const user = await User.find({ ...restOfPayload, ...query })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return user
  }

  static async findAdminParams(payload) {
    const { limit, skip, sort, search, ...restOfPayload } = payload

    let query = {}
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        ...restOfPayload,
      }
    }

    if (search === null || search === undefined) {
      query = {
        ...restOfPayload,
      }
    }

    const { currentSkip, currentLimit } = pagination(skip, limit)

    const admin = await Admin.find(
      {
        ...query, // Spread the query object to include its properties
        accountType: "normalAdmin",
      },
      { password: 0 }
    )
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return admin
  }

  static async updateCurriculumDetails(id, params) {
    return Curriculum.findOneAndUpdate(
      { ...id },
      { ...params },
      { new: true, runValidators: true }
    )
  }

  static async deleteCurriculumDetails(id, params) {
    return Curriculum.findOneAndDelete({ ...id })
  }
}

module.exports = { CurriculumRepository }
