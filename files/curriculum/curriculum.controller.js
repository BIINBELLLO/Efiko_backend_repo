const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils")
const path = require("path")
const { CustomError } = require("../../utils/errors")
const { CurriculumService } = require("./curriculum.service")

const createCurriculumController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    CurriculumService.createCurriculum(req, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getCurriculumController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    CurriculumService.getCurriculumService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateCurriculumController = async (req, res, next) => {
  const value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    CurriculumService.updateCurriculumService(value, req.params)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const deleteCurriculumController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    CurriculumService.deleteCurriculumService(req.params)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const downloadCurriculumController = async (req, res, next) => {
  try {
    const fileName = `${req.params.uuid}_curriculum.pdf`
    const filePath = path.join(
      __dirname,
      "../../utils/public/pdf/",
      fileName
    )

    // Set the appropriate content type for a PDF file
    res.setHeader("Content-Type", "application/pdf")
    // Set the content disposition to trigger a download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=downloaded-file.pdf"
    )

    return res.download(filePath)
  } catch (error) {
    console.log("error", error)
    return next(error)
  }
}

module.exports = {
  createCurriculumController,
  getCurriculumController,
  updateCurriculumController,
  deleteCurriculumController,
  downloadCurriculumController,
}
