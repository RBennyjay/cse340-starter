const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    message: req.flash("notice"),
    messageType: req.flash("messageType"),
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
    messageType: req.flash("messageType"),
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // Use bcrypt to hash the plain-text password with a salt round of 10
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
      messageType: "error",
      errors: null,
    })
  }

  // Use the hashed password in the model function
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
    req.flash("notice", "Sorry, the registration failed.")
    req.flash("messageType", "error")
    return res.status(501).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
      messageType: "error",
      errors: null,
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
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
      message: req.flash("notice"),
      messageType: req.flash("messageType"),
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
      message: req.flash("notice"),
      messageType: req.flash("messageType"),
      errors: null,
    })
  }

  // Don't include password in token
  delete accountData.account_password

  const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

  // Set token in httpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
     sameSite: "Strict",
    maxAge: 3600000 // 1 hour
  })

  req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
  req.flash("messageType", "success")
  res.redirect("/account")
}

function buildAccountDashboard(req, res) {
  const accountData = res.locals.accountData
  res.render("account/management", {
    title: "Account Management",
    accountData,
    nav: res.locals.nav,
    message: req.flash("notice"),
    messageType: req.flash("messageType")
  })
}

async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData
  })
}

const buildUpdateView = async (req, res) => {
  const account_id = req.params.account_id;
  const account = await accountModel.getAccountById(account_id);

  let nav = await utilities.getNav();
res.render("account/update", {
  title: "Update Account",
  nav,
  account,
  errors: null,
  message: null,
  updateErrors: [], 
  passwordErrors: [], 
  });
};

const updateAccount = async (req, res) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  const nav = await utilities.getNav();

  const updateResult = await accountModel.updateAccount({
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  });

  const accountData = await accountModel.getAccountById(account_id);

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account");
  } else {
    res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      account: accountData,
      updateErrors: [{ msg: "Update failed. Please try again." }],
      passwordErrors: [],
      message: null,
    });
  }
};




async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);

  const result = await accountModel.updatePassword(account_id, hashedPassword);

  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id);

  req.flash("notice", result ? "Password updated successfully." : "Password update failed.");

  res.render("account/update", {
    title: "Update Account",
    nav,
    account: accountData,
    message: req.flash("notice"),
    messageType: result ? "success" : "error",
    updateErrors: [],          
    passwordErrors: [],     
  });
}

const logout = (req, res) => {
  res.clearCookie("jwt");
  req.flash("message", "You have successfully logged out.");
  res.redirect("/");
};

async function buildChangePasswordView(req, res) {
  let nav = await utilities.getNav();
  const accountId = res.locals.accountData.account_id;

  res.render("account/update-password", {
  title: "Change Password",
  nav,
  account: { account_id: accountId },
  errors: [], 
  });
}





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
