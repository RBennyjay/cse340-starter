const { body, validationResult } = require("express-validator")

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty().withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/).withMessage("Classification name must be alphanumeric without spaces.")
  ]
}

const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const utilities = require(".")
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      message: null,
    })
  }
  next()
}

module.exports = { classificationRules, checkClassificationData }
