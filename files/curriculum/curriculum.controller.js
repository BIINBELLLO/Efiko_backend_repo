const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { CurriculumService } = require("./curriculum.service")

const createCurriculumController = async (req, res, next) => {
  const value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    CurriculumService.createCurriculum(value, res.locals.jwt)
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

module.exports = {
  createCurriculumController,
  getCurriculumController,
  updateCurriculumController,
  deleteCurriculumController,
}
