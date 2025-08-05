const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accountValidator = require('../utilities/account-validation'); 
// const regValidate = require('../utilities/account-validation'); 

// GET login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// GET register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.get("/", utilities.checkLogin, accountController.buildAccountDashboard)

router.get("/management", utilities.checkLogin, utilities.checkAdmin, accountController.buildAccountManagement)

router.get('/logout', accountController.logout);

// POST register form
router.post(
  "/register",
  accountValidator.registrationRules(),
  accountValidator.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// POST login route
router.post(
  "/login",
  accountValidator.loginRules(),
  accountValidator.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// GET update form
router.get('/update/:account_id', accountController.buildUpdateView);

router.get('/update-password-form', accountController.buildChangePasswordView);


// POST update account info
// router.post('/update',
//   accountValidator.updateAccountRules(),
//   accountValidator.checkUpdateData,
//   accountController.updateAccount
// );

router.post('/update',
  accountValidator.updateAccountRules(),
  // accountValidator.checkUpdateData,
  accountValidator.checkUpdateAccountData,
  accountController.updateAccount
);

// POST change password
// router.post('/update-password',
//   accountValidator.changePasswordRules(),
//   accountValidator.checkChangePassword,
//   accountController.updatePassword
// );

router.post('/update-password',
  accountValidator.changePasswordRules(),
  accountValidator.checkChangePassword,
  accountController.updatePassword
);


module.exports = router
