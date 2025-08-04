const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// GET login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// GET register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.get("/", utilities.checkLogin, accountController.buildAccountDashboard)

router.get("/management", utilities.checkLogin, accountController.buildAccountManagement)



// POST register form
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// POST login route
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
