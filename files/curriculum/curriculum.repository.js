const { pagination } = require("../../utils")
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
    const { limit, page, skip, sort, search, ...restOfPayload } = payload

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
    const { currentSkip, currentLimit } = pagination(page, limit)
    const curriculum = await Curriculum.find({ ...query })
      .sort(sort)
      .skip(currentSkip)
      .limit(currentLimit)

    return curriculum
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
