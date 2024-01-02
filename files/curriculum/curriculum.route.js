const curriculumRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { uploadManager } = require("../../utils/multer")
const {
  createCurriculumController,
  getCurriculumController,
  updateCurriculumController,
  deleteCurriculumController,
} = require("./curriculum.controller")

curriculumRoute.use(isAuthenticated)

//routes
curriculumRoute
  .route("/")
  .post(uploadManager("pdfFile").single("pdf"), createCurriculumController)

curriculumRoute.route("/").get(getCurriculumController)

curriculumRoute
  .route("/:id")
  .patch(uploadManager("pdfFile").single("pdf"), updateCurriculumController)

curriculumRoute.route("/:id").delete(deleteCurriculumController)

module.exports = curriculumRoute
