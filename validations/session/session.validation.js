const sessionValidation = {
  title: {
    notEmpty: true,
    errorMessage: "title cannot be empty",
  },
  category: {
    notEmpty: true,
    errorMessage: "category cannot be empty",
  },
  description: {
    notEmpty: true,
    errorMessage: "description cannot be empty",
  },
  outcome: {
    notEmpty: true,
    errorMessage: "outcome cannot be empty",
  },
  date: {
    notEmpty: true,
    errorMessage: "date cannot be empty",
  },
  time: {
    notEmpty: true,
    errorMessage: "time cannot be empty",
    trim: true,
  },
  charges: {
    notEmpty: true,
    errorMessage: "time cannot be empty",
  },
}

module.exports = { sessionValidation }
