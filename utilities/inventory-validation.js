const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

validate.inventoryRules = () => {
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

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationId = req.body?.classification_id || null
    const classificationList = await utilities.buildClassificationList(classificationId)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body,
    })
  }

  next()
}

validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    })
  }

  next()
}

module.exports = validate
