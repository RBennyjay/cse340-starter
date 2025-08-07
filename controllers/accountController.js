const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 * Deliver login view
 **************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    // message: req.flash("notice"),
    // messageType: req.flash("messageType"),
    errors: null,
  })
}

/* ****************************************
 * Deliver registration view
 **************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    // message: req.flash("notice"),
    // messageType: req.flash("messageType"),
    errors: null,
  })
}

/* ****************************************
 * Process Registration
 **************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = bcrypt.hashSync(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult?.rowCount > 0) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      req.flash("messageType", "success")
      return res.redirect("/account/login")
    } else {
      throw new Error("Registration failed")
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    req.flash("messageType", "error")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      // message: req.flash("notice"),
      // messageType: req.flash("messageType"),
      errors: null,
    })
  }
}

/* ****************************************
 * Process Login
 **************************************** */
async function loginAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Invalid email or password.")
    req.flash("messageType", "error")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      // message: req.flash("notice"),
      // messageType: req.flash("messageType"),
      errors: null,
    })
  }

  const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)

  if (!passwordMatch) {
    req.flash("notice", "Invalid email or password.")
    req.flash("messageType", "error")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      // message: req.flash("notice"),
      // messageType: req.flash("messageType"),
      errors: null,
    })
  }

  // Remove password before token generation
  delete accountData.account_password

  const tokenPayload = {
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
  }

  const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 3600000,
  })

  req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
  req.flash("messageType", "success")
  res.redirect("/account")
}

/* ****************************************
 * Account Dashboard
 **************************************** */
function buildAccountDashboard(req, res) {
  const accountData = res.locals.accountData
  res.render("account/management", {
    title: "Account Management",
    nav: res.locals.nav,
    accountData,
    // message: req.flash("notice"),
    // messageType: req.flash("messageType"),
  })
}

/* ****************************************
 * Account Management View
 **************************************** */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData,
    // message: req.flash("notice"),
    // messageType: req.flash("messageType"),
  })
}

/* ****************************************
 * Build Update View
 **************************************** */
async function buildUpdateView(req, res) {
  const account_id = req.params.account_id
  const account = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()

  res.render("account/update", {
    title: "Update Account",
    nav,
    account,
    message: null,
    updateErrors: [],
    passwordErrors: [],
  })
}

/* ****************************************
 * Process Account Info Update
 **************************************** */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const nav = await utilities.getNav()

  const updateResult = await accountModel.updateAccount({
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  })

  const accountData = await accountModel.getAccountById(account_id)

  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    req.flash("messageType", "success")
    res.redirect("/account")
  } else {
    res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      account: accountData,
      updateErrors: [{ msg: "Update failed. Please try again." }],
      passwordErrors: [],
      message: req.flash("notice"),
      messageType: "error",
    })
  }
}

/* ****************************************
 * Process Password Update
 **************************************** */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)

  const result = await accountModel.updatePassword(account_id, hashedPassword)

  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)

  req.flash("notice", result ? "Password updated successfully." : "Password update failed.")
  req.flash("messageType", result ? "success" : "error")

  res.render("account/update", {
    title: "Update Account",
    nav,
    account: accountData,
    message: req.flash("notice"),
    messageType: req.flash("messageType"),
    updateErrors: [],
    passwordErrors: [],
  })
}

/* ****************************************
 * Logout
 **************************************** */
function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have successfully logged out.")
  req.flash("messageType", "success")
  res.redirect("/")
}

/* ****************************************
 * Build Change Password View
 **************************************** */
async function buildChangePasswordView(req, res) {
  const nav = await utilities.getNav()
  const accountId = res.locals.accountData.account_id

  res.render("account/update-password", {
    title: "Change Password",
    nav,
    account: { account_id: accountId },
    errors: [],
    message: null,
    messageType: null,
  })
}

/* ****************************************
 * Export Controller Functions
 **************************************** */
module.exports = {
  buildLogin,
  buildRegister,
  accountLogin: loginAccount,
  registerAccount,
  buildAccountDashboard,
  buildAccountManagement,
  buildUpdateView,
  updateAccount,
  updatePassword,
  logout,
  buildChangePasswordView,
}
