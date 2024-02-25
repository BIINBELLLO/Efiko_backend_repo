const mongoose = require("mongoose")

const curriculumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    uniqueId: {
      type: String,
    },
    createdBy: { type: mongoose.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
)

const curriculum = mongoose.model("Curriculum", curriculumSchema, "curriculum")

module.exports = { Curriculum: curriculum }
