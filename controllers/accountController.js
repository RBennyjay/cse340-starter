const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    message: req.flash("notice"),
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    message: req.flash("notice"),
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult?.rowCount > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
    })
  }
}


async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Invalid email or password.")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      message: req.flash("notice"),
    })
  }

  const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)

  if (!passwordMatch) {
    req.flash("notice", "Invalid email or password.")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      message: req.flash("notice"),
    })
  }

  req.session.accountData = accountData
  req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
  res.redirect("/account/dashboard")
}


module.exports = {
  buildLogin,
  buildRegister,
  loginAccount,
  registerAccount,
}
