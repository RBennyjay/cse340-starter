const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

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
      .notEmpty().withMessage("A valid email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      }),

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


/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
      
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}


/* ******************************
 * Check registration data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      message: errors.array().map(err => err.msg),
      messageType: ["error"],
      errors: null
    })
    return
  }

  next()
}


/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      account_email,
      message: errors.array().map(err => err.msg),
      messageType: ["error"]
    })
    return
  }

  next()
}


/* **********************************
 *  Update Account Data Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a first name."),
    
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required.")
  ];
};

/* **********************************
 *  Change Password Validation Rules
 * ********************************* */
validate.changePasswordRules = () => {
  return [
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
  ];
};

/* **********************************
 *  Check Change Password Data
 * ********************************* */
validate.checkChangePassword = async (req, res, next) => {
  const { account_id } = req.body;
  const errors = validationResult(req);

  const accountData = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      account: accountData,
      updateErrors: null,
      passwordErrors: errors.array(),  
      message: null,
      messageType: ["error"],
    });
  }

  next();
};


validate.checkUpdateAccountData = async (req, res, next) => {
  const { account_id } = req.body;
  const errors = validationResult(req);

  const accountData = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      account: accountData,
      updateErrors: errors.array(),  
      passwordErrors: null,
      message: null,
      messageType: ["error"],
    });
  }

  next();
};



module.exports = validate


