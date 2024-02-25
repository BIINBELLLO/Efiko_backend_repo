const curriculumRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const {
  createCurriculumController,
  getCurriculumController,
  updateCurriculumController,
  deleteCurriculumController,
  downloadCurriculumController,
} = require("./curriculum.controller")

curriculumRoute.use(isAuthenticated)

//routes
curriculumRoute.route("/").post(createCurriculumController)
curriculumRoute.route("/").get(getCurriculumController)
curriculumRoute.route("/:id").patch(updateCurriculumController)
curriculumRoute.route("/:id").delete(deleteCurriculumController)
curriculumRoute.route("/download/:uuid").get(downloadCurriculumController)

module.exports = curriculumRoute
