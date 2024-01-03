const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../utils")
const {
  CurriculumSuccess,
  CurriculumFailure,
} = require("./curriculum.messages")
const { CurriculumRepository } = require("./curriculum.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class CurriculumService {
  static async createCurriculum(payload, jwt) {
    const { image, body } = payload

    const curriculumExist =
      await CurriculumRepository.findSingleCurriculumWithParams({
        title: body.title,
      })

    if (curriculumExist) return { success: false, msg: CurriculumFailure.EXIST }

    const curriculum = await CurriculumRepository.create({
      createdBy: new mongoose.Types.ObjectId(jwt._id),
      pdfFile: image,
      ...body,
    })

    if (!curriculum._id)
      return { success: false, msg: CurriculumFailure.CREATE }

    return {
      success: true,
      msg: CurriculumSuccess.CREATE,
    }
  }

  static async getCurriculumService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Curriculum"
    )
    if (error) return { success: false, msg: error }

    const total = await CurriculumRepository.findCurriculumWithParams()

    const curriculum = await CurriculumRepository.findAllCurriculumParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (curriculum.length < 1)
      return { success: true, msg: CurriculumFailure.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: CurriculumSuccess.FETCH,
      data: curriculum,
      length: curriculum.length,
      total: total.length,
    }
  }

  static async updateCurriculumService(data, params) {
    const { image, body } = data
    const curriculum = await CurriculumRepository.updateCurriculumDetails(
      { _id: new mongoose.Types.ObjectId(params.id) },
      {
        pdfFile: image,
        ...body,
      }
    )

    if (!curriculum)
      return {
        success: false,
        msg: CurriculumFailure.CREATE,
      }

    return {
      success: true,
      msg: CurriculumSuccess.UPDATE,
    }
  }

  static async deleteCurriculumService(params) {
    const curriculum = await CurriculumRepository.deleteCurriculumDetails({
      _id: new mongoose.Types.ObjectId(params.id),
    })

    if (!curriculum)
      return {
        success: false,
        msg: CurriculumFailure.DELETE,
      }

    return {
      success: true,
      msg: CurriculumSuccess.DELETE,
    }
  }
}

module.exports = { CurriculumService }
