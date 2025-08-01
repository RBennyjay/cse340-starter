const { body, validationResult } = require("express-validator")

const inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),

    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
  ]
}

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const utilities = require(".")
    const nav = await utilities.getNav()

    //  optional chaining to avoid crash if req.body is undefined
    const classificationId = req.body?.classification_id || null

    //  fallback value instead of accessing req.body again
    const classificationList = await utilities.buildClassificationList(classificationId)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body, // spreads all form fields back into the view
    })
  }

  next()
}

module.exports = {
  inventoryRules,
  checkInventoryData,
}
