const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')


// Route for Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Register route
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to handle registration form submission
// router.post('/register', utilities.handleErrors(accountController.registerAccount))

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.post("/login", accountController.loginAccount)


module.exports = router
