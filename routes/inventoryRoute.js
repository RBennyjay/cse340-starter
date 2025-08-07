// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")
// const inventoryValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")
const checkRole = require("../middleware/checkRole");
const invCont = require('../controllers/invController');



// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)
// router.get("/detail/:inv_id", invController.buildDetailView)
router.get("/detail/:inv_id", invController.buildById)
// router.get("/", invController.buildInventory)
// router.get("/", utilities.checkLogin, utilities.handleErrors(invController.buildManagement))
router.get("/", utilities.checkLogin, checkRole(["Employee", "Manager"]), utilities.handleErrors(invController.buildManagement))



// Error testing route
router.get("/error", (req, res, next) => {
  next(new Error("Deliberate test error from /inv/error"))
})

// Inventory Management Routes
// router.get(
//   "/management",
//   utilities.checkLogin,
//   checkRole(["Employee", "Manager"]),
//   utilities.handleErrors(invController.buildManagement)
// )

router.get(
  "/management",
  utilities.checkLogin,            // ensures they're logged in
  checkRole(["Employee", "Admin"]), // ensures they're employee or admin
  utilities.handleErrors(invController.buildManagement)
)

// JSON inventory endpoint for dropdown fetch
router.get(
  "/getInventory/:classification_id",
  utilities.checkLogin,
  checkRole(["Employee", "Admin"]),
  invCont.getInventoryJSON
)


router.get(
  "/add-classification",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  invController.buildAddClassification
)

router.post(
  "/add-classification",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  validate.classificationRules(),
  validate.checkClassificationData,
  invController.addClassification
)

router.get(
  "/add-inventory",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  invController.buildAddInventory
)

router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  utilities.handleErrors(invController.editInventoryView)
)

router.post(
  "/add-inventory",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
)

router.post(
  "/update",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  invController.updateInventory
)

router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  utilities.handleErrors(invController.buildDeleteInventoryView)
)

router.post(
  "/delete",
  utilities.checkLogin,
  checkRole(["Employee", "Manager"]),
  utilities.handleErrors(invController.deleteInventoryItem)
)


module.exports = router

