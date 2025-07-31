const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty().withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty().withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .escape()
      .notEmpty().withMessage("A valid email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .bail()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }).withMessage("Password must be at least 12 characters, contain 1 uppercase letter, 1 number, and 1 special character."),
  ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Registration",
    nav,
    account_firstname,
    account_lastname,
    account_email,
    message: errors.array().map(err => err.msg),
    messageType: ["error"]
  })
  return
}


  next()
}

module.exports = validate
