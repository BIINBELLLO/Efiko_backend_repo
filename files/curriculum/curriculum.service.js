const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../utils")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const { uploadManager } = require("../../utils/multer")
const {
  CurriculumSuccess,
  CurriculumFailure,
} = require("./curriculum.messages")
const { CurriculumRepository } = require("./curriculum.repository")

const { LIMIT, SKIP, SORT } = require("../../constants")

class CurriculumService {
  static async createCurriculum(data, jwt) {
    if (!data.files || !data.files.image)
      return { success: false, msg: `Please upload a pdf file` }

    const pdfFile = data.files.image

    if (!pdfFile.name.endsWith("pdf"))
      return { success: false, msg: `Please upload a pdf file format` }

    const curriculumExist =
      await CurriculumRepository.findSingleCurriculumWithParams({
        title: data.body.title,
      })

    if (curriculumExist) return { success: false, msg: CurriculumFailure.EXIST }

    let randomId
    let validateCurriculum
    do {
      randomId = uuidv4()
      validateCurriculum =
        await CurriculumRepository.findSingleCurriculumWithParams({
          uniqueId: randomId,
        })
    } while (validateCurriculum)

    const pdfFilename = `${randomId}_curriculum.pdf`

    const pdfFilePath = path.join(
      __dirname,
      "../../utils/public/pdf/" + `${pdfFilename}`
    )
    await pdfFile.mv(pdfFilePath)

    const { body } = data

    const curriculum = await CurriculumRepository.create({
      createdBy: new mongoose.Types.ObjectId(jwt._id),
      uniqueId: randomId,
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

    const total = await CurriculumRepository.findAllCurriculumParams({
      ...params,
    })

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
    let pdfFile = data.files.image

    const { body } = data

    if (pdfFile && !pdfFile.name.endsWith("pdf"))
      return { success: false, msg: `Please upload a pdf file format` }

    const curriculum = await CurriculumRepository.updateCurriculumDetails(
      { _id: new mongoose.Types.ObjectId(params.id) },
      {
        ...body,
      }
    )

    if (!curriculum)
      return {
        success: false,
        msg: CurriculumFailure.CREATE,
      }

    const pdfFileName = `${curriculum.uniqueId}_curriculum.pdf`
    console.log("pdfFileName", pdfFileName)

    const pdfFilePath = path.join(
      __dirname,
      "../../utils/public/pdf/" + `${pdfFileName}`
    )

    if (pdfFile) {
      try {
        // Move the uploaded PDF file to the destination
        await pdfFile.mv(pdfFilePath)
      } catch (error) {
        console.error("Error moving PDF file:", error)
        return { success: false, msg: "Error updating PDF file." }
      }
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
