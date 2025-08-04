// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validate = require("../utilities/classification-validation")
const inventoryValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:inv_id", invController.buildDetailView)
// router.get("/", invController.buildInventory)
router.get("/", utilities.checkLogin, utilities.handleErrors(invController.buildManagement))


// Error testing route
router.get("/error", (req, res, next) => {
  next(new Error("Deliberate test error from /inv/error"))
})

// Inventory Management Routes
router.get("/management", invController.buildManagement)
router.get("/add-classification", invController.buildAddClassification)
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassificationData,
  invController.addClassification
)

router.get("/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)


router.get("/add-inventory", invController.buildAddInventory)

router.post(
  "/add-inventory",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  invController.addInventory
)


module.exports = router

